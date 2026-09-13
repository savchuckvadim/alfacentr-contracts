#!/usr/bin/env node
/**
 * Синхронизация раздела базы знаний из markdown репозитория.
 *
 * Источник истины — файлы в docs/knowledge-base: структура в manifest.json,
 * содержимое в markdown. Скрипт идемпотентен: документы сопоставляются по
 * заголовку внутри своего родителя, поэтому повторный прогон обновляет
 * страницы, а не плодит копии.
 *
 * Что НЕ делает намеренно: не удаляет страницы, которых нет в манифесте.
 * Люди дописывают базу знаний руками, и синхронизация не должна сносить
 * чужую работу — лишнее печатается списком, решение за человеком.
 *
 * База знаний 2.0 живёт в REST 3.0, а он вызывается по другому пути, чем
 * обычный REST: /rest/api/{userId}/{token}/{method}, без .json на конце.
 *
 * Запуск:
 *   BITRIX_DOMAIN=... BITRIX_KEY=rest/502/xxxx node scripts/sync-knowledge-base.mjs
 *   опции: DRY=1 — только показать план, ничего не писать
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(HERE, '../../../docs/knowledge-base');
const MANIFEST = path.join(CONTENT_DIR, 'manifest.json');

const DOMAIN = process.env.BITRIX_DOMAIN;
const KEY = (process.env.BITRIX_KEY || '').replace(/^\/+|\/+$/g, '');
const DRY = process.env.DRY === '1';

if (!DOMAIN || !KEY) {
    console.error('Нужны BITRIX_DOMAIN и BITRIX_KEY (формат rest/{userId}/{token})');
    process.exit(1);
}

const V3_BASE = `https://${DOMAIN}/rest/api/${KEY.replace(/^rest\//, '')}`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function call(method, params = {}, tries = 3) {
    for (let attempt = 1; attempt <= tries; attempt++) {
        try {
            const res = await fetch(`${V3_BASE}/${method}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });
            const json = await res.json().catch(() => null);
            if (!res.ok || !json || json.error) {
                throw new Error(
                    `HTTP ${res.status} ${JSON.stringify(json && (json.error || json)).slice(0, 200)}`,
                );
            }
            return json;
        } catch (error) {
            if (attempt === tries) throw new Error(`${method}: ${error.message}`);
            await sleep(600 * attempt);
        }
    }
}

/** Заголовок — ключ сопоставления, поэтому сравниваем без лишних пробелов */
const key = title => String(title ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

function readContent(node) {
    if (!node.file) return node.intro ? `${node.intro}\n` : '';
    const full = path.join(CONTENT_DIR, node.file);
    if (!fs.existsSync(full)) {
        throw new Error(`В манифесте указан файл, которого нет: ${node.file}`);
    }
    return fs.readFileSync(full, 'utf8');
}

async function findOrCreateCollection(name) {
    const list = await call('note.collection.list', { pagination: { limit: 200 } });
    const items = list?.result?.items || [];
    const found = items.find(c => key(c.name) === key(name));
    if (found) {
        console.log(`база знаний «${found.name}» уже есть, id=${found.id}`);
        return found.id;
    }
    if (DRY) {
        console.log(`[dry] создать базу знаний «${name}»`);
        return null;
    }
    const created = await call('note.collection.add', { fields: { name } });
    const id = created?.result?.item?.id;
    console.log(`создана база знаний «${name}», id=${id}`);
    return id;
}

let stats = { created: 0, updated: 0, unchanged: 0, kept: 0, skipped: 0 };

/**
 * Режим синхронизации раздела, наследуется от родителя.
 *
 * always — страница перезаписывается из репозитория: так живёт техническая
 *   часть, её источник истины — код.
 * once — страница создаётся, если её нет, и больше не трогается: так живут
 *   процессы и инструкции для менеджера, их правят люди прямо в базе знаний.
 *
 * По умолчанию once: молча затирать чужую работу опаснее, чем не обновить.
 */
function resolveMode(node, inherited) {
    return node.sync || inherited || 'once';
}

async function syncNode(node, collectionId, parentId, siblings, inheritedMode) {
    const mode = resolveMode(node, inheritedMode);
    const markdown = readContent(node);
    const existing = (siblings || []).find(d => key(d.title) === key(node.title));

    let id = existing?.id ?? null;

    if (!existing) {
        if (DRY) {
            console.log(`[dry] создать «${node.title}»${parentId ? ` под ${parentId}` : ''}`);
            stats.created++;
        } else {
            const res = await call('note.document.add', {
                fields: {
                    collectionId,
                    title: node.title,
                    ...(parentId ? { parentId } : {}),
                    markdown,
                },
            });
            id = res?.result?.item?.id;
            console.log(`создана «${node.title}», id=${id}`);
            stats.created++;
        }
    } else if (mode === 'once') {
        console.log(`оставлена как есть «${node.title}» (id=${existing.id}, режим once)`);
        stats.kept++;
    } else {
        // Сравниваем с тем, что лежит в базе: лишние записи создают версии
        // документа и мусорят историей правок
        const current = await call('note.document.get', { id: existing.id });
        const stored = current?.result?.item?.markdown ?? '';
        if (stored.trim() === markdown.trim()) {
            console.log(`без изменений «${node.title}» (id=${existing.id})`);
            stats.unchanged++;
        } else if (DRY) {
            console.log(`[dry] обновить «${node.title}» (id=${existing.id})`);
            stats.updated++;
        } else {
            await call('note.document.update', {
                id: existing.id,
                fields: { title: node.title, markdown },
                overwrite: true,
            });
            console.log(`обновлена «${node.title}» (id=${existing.id})`);
            stats.updated++;
        }
    }

    if (node.children?.length) {
        const childSiblings = existing?.children || [];
        for (const child of node.children) {
            await syncNode(child, collectionId, id, childSiblings, mode);
        }
    }
}

/** Страницы, которых нет в манифесте: не удаляем, только показываем */
function reportExtra(nodes, manifestNodes, trail = []) {
    const known = new Set((manifestNodes || []).map(n => key(n.title)));
    for (const doc of nodes || []) {
        if (!known.has(key(doc.title))) {
            console.log(
                `  вне манифеста: ${[...trail, doc.title].join(' / ')} (id=${doc.id})`,
            );
            stats.skipped++;
            continue;
        }
        const manifestNode = manifestNodes.find(n => key(n.title) === key(doc.title));
        reportExtra(doc.children, manifestNode?.children, [...trail, doc.title]);
    }
}

(async () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    console.log(`манифест: «${manifest.collection}», корневых разделов ${manifest.tree.length}`);
    console.log(DRY ? '=== DRY RUN, ничего не пишем ===' : '');

    const collectionId = await findOrCreateCollection(manifest.collection);
    if (!collectionId) {
        console.log('нет id базы знаний — дальше только в реальном прогоне');
        return;
    }

    const tree = await call('note.document.tree.list', { collectionId });
    const roots = tree?.result?.items || [];

    for (const node of manifest.tree) {
        await syncNode(node, collectionId, null, roots, manifest.sync);
    }

    console.log('');
    console.log('--- страницы вне манифеста ---');
    const treeAfter = await call('note.document.tree.list', { collectionId });
    reportExtra(treeAfter?.result?.items || [], manifest.tree);
    if (!stats.skipped) console.log('  нет');

    console.log('');
    console.log(
        `итого: создано ${stats.created}, обновлено ${stats.updated}, без изменений ${stats.unchanged}, оставлено как есть ${stats.kept}, вне манифеста ${stats.skipped}`,
    );
    console.log(`база знаний: https://${DOMAIN}/knowledge/`);
})().catch(e => {
    console.error('ОШИБКА:', e.message);
    process.exit(1);
});
