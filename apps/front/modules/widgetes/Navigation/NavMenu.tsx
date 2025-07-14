'use client'
import Link from "next/link"

export const NavMenu = () => {
    return (
        <div className="flex items-center justify-between"      >
            <nav className="hidden md:flex items-center space-x-6">
                <Link href="/bitrix" className="text-gray-600 hover:text-primary transition-colors">
                    Главная
                </Link>
                <Link href="/bitrix" className="text-gray-600 hover:text-primary transition-colors">
                    Заявка
                </Link>
                <Link href="/participants" className="text-gray-600 hover:text-primary transition-colors">
                    Участники
                </Link>
                <Link href="/products" className="text-gray-600 hover:text-primary transition-colors">
                    Товары
                </Link>
                <Link href="/bx-rq" className="text-gray-600 hover:text-primary transition-colors">
                    Реквизиты
                </Link>
            </nav>

            {/* Мобильное меню */}
            <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
    )
}

