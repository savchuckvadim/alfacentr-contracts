

import "@workspace/ui/globals.css"

import { Header } from "@/modules/widgetes/Header/Header"
import { CompanyBrand } from "@/modules/entities/company"
import { App } from "@/modules/app"



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (

    // <html lang="en" suppressHydrationWarning>

    //   <body
    //     className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
    //   >
    //     <Providers>
          <div >
            {/* Хедер */}
            <Header brandComponent={<CompanyBrand />} />
            <App>

              {children}
            </App>
          </div>
    //     </Providers>
    //   </body>

    // </html>

  )
}
