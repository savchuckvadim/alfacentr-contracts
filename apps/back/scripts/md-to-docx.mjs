#!/usr/bin/env node
/**
 * Конвертер отчётов из markdown в Word.
 *
 * Понимает то подмножество разметки, которым написаны отчёты в корне
 * репозитория: заголовки, абзацы, таблицы, списки, горизонтальные линии,
 * жирный текст и код в обратных кавычках. Ничего лишнего — это не
 * универсальный конвертер, а инструмент под наши документы.
 *
 * Запуск:
 *   node scripts/md-to-docx.mjs WORK_REPORT_DOCUMENT_NUMBERING.md docs/WORK_REPORT_DOCUMENT_NUMBERING.docx
 */

import fs from 'node:fs';
import path from 'node:path';
import {
    AlignmentType,
    BorderStyle,
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} from 'docx';

const [, , inputArg, outputArg] = process.argv;
if (!inputArg) {
    console.error('Укажите входной markdown и, при желании, выходной .docx');
    process.exit(1);
}

const input = path.resolve(inputArg);
const output = path.resolve(
    outputArg ||
        path.join('docs', path.basename(inputArg).replace(/\.md$/i, '.docx')),
);

const FONT = 'Calibri';

/** Разбирает **жирный** и `код` в наборе фрагментов Word */
function inline(text, { bold = false, size = 22 } = {}) {
    const runs = [];
    const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let match;

    const push = (value, extra = {}) => {
        if (!value) return;
        runs.push(
            new TextRun({ text: value, font: FONT, size, bold, ...extra }),
        );
    };

    while ((match = re.exec(text)) !== null) {
        push(text.slice(last, match.index));
        const token = match[0];
        if (token.startsWith('**')) {
            push(token.slice(2, -2), { bold: true });
        } else {
            push(token.slice(1, -1), { font: 'Consolas', size: size - 2 });
        }
        last = match.index + token.length;
    }
    push(text.slice(last));
    return runs;
}

const splitRow = line =>
    line
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim());

const isDivider = line => /^\|?[\s:|-]+\|[\s:|-]*$/.test(line);

function buildTable(rows) {
    const [header, ...body] = rows;
    const width = { size: 100, type: WidthType.PERCENTAGE };

    const makeRow = (cells, bold) =>
        new TableRow({
            tableHeader: bold,
            children: cells.map(
                cell =>
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: inline(cell, { bold, size: 20 }),
                            }),
                        ],
                        margins: { top: 60, bottom: 60, left: 100, right: 100 },
                    }),
            ),
        });

    return new Table({
        width,
        rows: [makeRow(header, true), ...body.map(cells => makeRow(cells, false))],
    });
}

const markdown = fs.readFileSync(input, 'utf8').replace(/\r\n/g, '\n');
const lines = markdown.split('\n');
const children = [];
let tableBuffer = null;

const flushTable = () => {
    if (tableBuffer && tableBuffer.length) {
        children.push(buildTable(tableBuffer));
        children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
    }
    tableBuffer = null;
};

for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith('|')) {
        if (isDivider(line)) continue;
        tableBuffer = tableBuffer || [];
        tableBuffer.push(splitRow(line));
        continue;
    }
    flushTable();

    if (!line.trim()) continue;

    if (/^---+$/.test(line.trim())) {
        children.push(
            new Paragraph({
                text: '',
                border: {
                    bottom: {
                        style: BorderStyle.SINGLE,
                        size: 6,
                        color: 'C8CDD4',
                    },
                },
                spacing: { before: 160, after: 160 },
            }),
        );
        continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
        const level = heading[1].length;
        const levels = {
            1: HeadingLevel.TITLE,
            2: HeadingLevel.HEADING_1,
            3: HeadingLevel.HEADING_2,
            4: HeadingLevel.HEADING_3,
        };
        children.push(
            new Paragraph({
                heading: levels[level],
                alignment: level === 1 ? AlignmentType.CENTER : undefined,
                spacing: { before: level === 1 ? 0 : 240, after: 120 },
                children: inline(heading[2], {
                    size: level === 1 ? 32 : level === 2 ? 28 : 24,
                    bold: true,
                }),
            }),
        );
        continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
        children.push(
            new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 60 },
                children: inline(bullet[1]),
            }),
        );
        continue;
    }

    const numbered = /^(\d+)\.\s+(.*)$/.exec(line);
    if (numbered) {
        children.push(
            new Paragraph({
                spacing: { after: 60 },
                indent: { left: 360 },
                children: inline(`${numbered[1]}. ${numbered[2]}`),
            }),
        );
        continue;
    }

    children.push(
        new Paragraph({
            spacing: { after: 120 },
            children: inline(line.replace(/^>\s?/, '')),
        }),
    );
}
flushTable();

const doc = new Document({
    styles: {
        default: {
            document: { run: { font: FONT, size: 22 } },
        },
    },
    sections: [
        {
            properties: {
                page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } },
            },
            children,
        },
    ],
});

const buffer = await Packer.toBuffer(doc);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, buffer);
console.log(
    `готово: ${path.relative(process.cwd(), output)} (${(buffer.length / 1024).toFixed(1)} КБ, абзацев и таблиц ${children.length})`,
);
