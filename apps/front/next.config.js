import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Корень монорепо. Нужен standalone-сборке: от него Next считает пути
// трассировки, и в образ попадают workspace-пакеты и node_modules из корня.
// Next нашёл бы его и сам по pnpm-lock.yaml, но явное значение не зависит
// от lock-файлов выше по дереву каталогов.
const monorepoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..',
);

/**
 * Раньше здесь была проверка обязательных ONLINE_API_KEY, IN_BITRIX и
 * LOG_FILE_PATH и блок env с ними же. Код фронта и пакетов эти переменные не
 * читает, а сборка без них падала. Из-за этого образ нельзя было собрать без
 * apps/front/.env, то есть в GitHub Actions. Хуже того, standalone-сборка
 * вписывает весь конфиг вместе с env в server.js, и ключ оказался бы в образе.
 *
 * Единственная переменная, которая влияет на бандл, — NEXT_PUBLIC_NODE_MODE
 * (modules/app/consts/app-global.ts). Она встраивается при сборке и задаётся
 * через ARG в docker/Dockerfile.front, по умолчанию production.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Next кладёт в .next/standalone готовый server.js и только нужные ему
    // файлы из node_modules. Финальной стадии образа больше не нужен
    // pnpm install, который шёл 13 минут и раздувал образ
    output: 'standalone',
    outputFileTracingRoot: monorepoRoot,

    typescript: {
        ignoreBuildErrors: false,
    },

    // Пакеты с main на src/*.ts транспилируются вместе с фронтом.
    // @alfa/entities и @workspace/bx-rq подключаются из dist, их собирает
    // стадия packages в docker/Dockerfile.front
    transpilePackages: [
        '@workspace/api',
        '@workspace/ui',
        '@workspace/bitrix',
        '@workspace/bx-rq',
        '@workspace/theme',
        '@workspace/pbx',
        '@workspace/ws',
    ],
};

export default nextConfig;
