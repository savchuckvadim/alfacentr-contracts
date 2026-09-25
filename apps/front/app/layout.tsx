import localFont from 'next/font/local';
import type { ReactNode } from 'react';

import '@workspace/ui/globals.css';
import { Providers } from '@/components/providers';
import { LoadingScreen } from '@/modules/shared';

/**
 * Шрифты лежат в репозитории, а не тянутся из next/font/google.
 *
 * next/font/google скачивает шрифт во время сборки, и сборка начинает
 * зависеть от доступности fonts.googleapis.com. На сервере он недоступен —
 * деплой фронта падал с «Failed to fetch Geist from Google Fonts», притом что
 * код был исправен. Локальные файлы делают сборку детерминированной и заодно
 * быстрее: сети в этом шаге больше нет.
 *
 * Файлы — вариативные Geist и Geist Mono из официального пакета geist,
 * лицензия OFL. Имена CSS-переменных те же, что были, поэтому Tailwind и
 * globals.css не меняются.
 */
const fontSans = localFont({
    src: './fonts/Geist-Variable.woff2',
    weight: '100 900',
    style: 'normal',
    display: 'swap',
    variable: '--font-sans',
});

const fontMono = localFont({
    src: './fonts/GeistMono-Variable.woff2',
    weight: '100 900',
    style: 'normal',
    display: 'swap',
    variable: '--font-mono',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>): ReactNode {
    return (
        <html lang="en" className="scrollbar-hide" suppressHydrationWarning>
            <body
                className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
            >
                <LoadingScreen />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
