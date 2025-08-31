'use client';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NavMenu = ({ withMobile = true }: { withMobile?: boolean }) => {
    const pathname = usePathname();

    const navItems = [
        { href: '/bitrix/main', label: 'Главная' },
        { href: '/bitrix/client-bid', label: 'Заявка' },
        { href: '/bitrix/participants', label: 'Участники' },
        { href: '/bitrix/products', label: 'Товары' },
        { href: '/bitrix/bx-rq', label: 'Реквизиты' },
    ];

    return (
        <div className="flex items-center justify-between">
            <nav className="hidden md:flex items-center space-x-6">
                {navItems.map(({ href, label }) => (
                    <Badge key={`nav-badge-${href}`} variant={pathname.startsWith(href) ? "default" : "outline"}
                    className="text-xs">
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'transition-colors',
                                // pathname.startsWith(href)
                                //     ? 'text-primary font-medium'
                                //     : 'text-gray-600 hover:text-primary',
                            )}
                        >
                            {label}
                        </Link>
                    </Badge>
                ))}
            </nav>

            {/* Мобильное меню */}
            {withMobile && (
                <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
};
