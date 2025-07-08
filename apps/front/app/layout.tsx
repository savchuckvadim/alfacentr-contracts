import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import { Header } from "@/modules/shared/Header/Header"
import { CompanyBrand } from "@/modules/entities/company"
import { App } from "@/modules/app"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (

    <html lang="en" suppressHydrationWarning>

      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>
          <div className="min-h-screen bg-gray-50">
            {/* Хедер */}
            <Header brandComponent={<CompanyBrand />} />
            <App>

              {children}
            </App>
          </div>
        </Providers>
      </body>

    </html>

  )
}
