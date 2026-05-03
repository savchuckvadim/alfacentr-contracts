import { Geist, Geist_Mono } from 'next/font/google';

import '@workspace/ui/globals.css';
import { Providers } from '@/components/providers';
import { LoadingScreen } from '@/modules/shared';

const fontSans = Geist({
    subsets: ['latin'],
    variable: '--font-sans',
});

const fontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

import type { ReactElement } from 'react';

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactElement;
}>): ReactElement  {
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
