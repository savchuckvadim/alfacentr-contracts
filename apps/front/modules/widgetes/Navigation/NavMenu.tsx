'use client';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';


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
                    <motion.div
                        key={`nav-badge-${href}`}
                        // initial={{ opacity: 0 }}
                        // animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97}} // <-- эффект нажатия
                            transition={{ type: "spring", stiffness: 100 }}
                        >
                            <Button
                                variant={!pathname.startsWith(href) ? "ghost" : "default"}
                                className="h-7"
                            >
                                <Link
                                    href={href}
                                    className={cn(
                                        "transition-colors",

                                    )}
                                >
                                    {label}
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>
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
