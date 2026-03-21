import process from 'node:process';

// Проверяем наличие обязательных переменных окружения
const requiredEnvVars = ['ONLINE_API_KEY', 'IN_BITRIX', 'LOG_FILE_PATH'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    // compress: false, // <--- отключает gzip-сжатие и минификацию на сервере

    // // если хочешь также отключить минификацию сборки (клиентского JS), допиши:
    // webpack(config, { dev, isServer }) {
    //     if (!dev) {
    //         config.optimization.minimize = false;
    //     }
    //     return config;
    // },
    // reactStrictMode: true,

    // productionBrowserSourceMaps: true, // ✅ включаем sourcemaps для браузера
    env: {
        ONLINE_API_KEY: process.env.ONLINE_API_KEY,
        LOG_FILE_PATH: process.env.LOG_FILE_PATH,
        IN_BITRIX: process.env.IN_BITRIX,
    },
    // Добавляем поддержку TypeScript для конфигурации
    typescript: {
        // Включаем проверку типов при сборке
        ignoreBuildErrors: false,
    },

    // Настройки для монорепозитория
    transpilePackages: [
        '@workspace/api',
        '@workspace/ui',
        '@workspace/alfa',
        '@workspace/bitrix',
        '@workspace/bx-rq',
        '@workspace/theme',
        '@workspace/pbx',
        '@workspace/ws',
        // 'lvovich',
        // 'russian-nouns-js',
        // 'number-to-words-ru',
        // 'i',
        // 'lucide-react',
        // 'framer-motion',
        // 'date-fns',
    ],
};

export default nextConfig;
