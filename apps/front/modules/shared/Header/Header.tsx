import React from 'react';
import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn(
      "w-full bg-white border-b border-gray-200 shadow-sm",
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              Alfacentr
            </Link>
          </div>

          {/* Навигация */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Главная
            </Link>
            <Link href="/participants" className="text-gray-600 hover:text-gray-900 transition-colors">
              Участники
            </Link>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Проекты
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Контакты
            </a>
          </nav>

          {/* Мобильное меню */}
          <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
} 