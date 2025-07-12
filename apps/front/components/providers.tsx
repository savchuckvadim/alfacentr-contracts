"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Provider } from "react-redux"
import { store } from "@/modules/app/model/store"
import { ErrorBoundary } from "@/modules/app/providers/ErrorBoundary"
import { AprilThemeProvider } from "@workspace/theme"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <AprilThemeProvider>
            {children}
          </AprilThemeProvider>
        </NextThemesProvider>
      </Provider>
    </ErrorBoundary>
  )
}
