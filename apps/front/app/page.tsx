import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh bg-background">
      <div className="flex flex-col items-center justify-center gap-6 bg-background p-8 rounded-lg border">
        <h1 className="text-3xl font-bold text-foreground">Alfacentr</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Демонстрационная страница для управления товарами и участниками
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/products">
            <Button className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Товары
            </Button>
          </Link>
          
          <Link href="/participants">
            <Button variant="outline" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Участники
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


