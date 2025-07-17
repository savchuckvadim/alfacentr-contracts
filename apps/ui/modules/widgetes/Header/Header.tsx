'use client'
import React from 'react';
import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';
import { DocumentGlobalConfig } from '@/modules/widgetes';
import { useApp } from '@/modules/app';
import { NavMenu } from '../Navigation/NavMenu';


interface HeaderProps {
  brandComponent?: React.ReactNode;
  className?: string;
}

export function Header({ className, brandComponent }: HeaderProps) {
  const { isClient } = useApp()
  if (!isClient) {
    return null
  }
  return (
    <>
      <header className={cn(
        "w-full  bg-background border-primary-foreground ",
        className
      )}>
        <div className="w-full  mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Логотип */}
            <div className="flex items-center space-x-3">
              {/* <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div> */}
              {brandComponent || <Link href="/bitrix" className="text-xl font-semibold text-primary-foreground hover:text-blue-600 transition-colors">
                Alfacentr
              </Link>}
            </div>

            {/* Навигация */}
            <NavMenu withMobile={false} />

          
          </div>
        </div>

      </header>
      {isClient && <DocumentGlobalConfig />}
    </>
  );
} 