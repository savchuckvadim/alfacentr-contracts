'use client';

import * as React from 'react';
import {
    ThemeProvider as NextThemesProvider,
    useTheme as useNextTheme,
} from 'next-themes';
import { Provider } from 'react-redux';
import { store } from '@/modules/app/model/store';
import { ErrorBoundary } from '@/modules/app/providers/ErrorBoundary';
import { AprilThemeProvider } from '@workspace/theme';

// Компонент-обертка для передачи значений темы в AprilThemeProvider
function AprilThemeProviderWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme, resolvedTheme, setTheme } = useNextTheme();

    return (
        <AprilThemeProvider
            theme={theme}
            resolvedTheme={resolvedTheme}
            setTheme={setTheme}
        >
            {children}
        </AprilThemeProvider>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <NextThemesProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
                enableColorScheme
                storageKey="theme"
            >
                <AprilThemeProviderWrapper>
                    <ErrorBoundary>{children}</ErrorBoundary>
                </AprilThemeProviderWrapper>
            </NextThemesProvider>
        </Provider>
    );
}
