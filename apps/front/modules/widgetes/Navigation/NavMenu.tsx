'use client';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useIsUpContractType } from '@/modules/features';
import { useEffect, useMemo, useState } from 'react';

export const NavMenu = ({ withMobile = true }: { withMobile?: boolean }) => {
    const pathname = usePathname();
    const { isUp, isContractTypeLoading, currentContractType } =
        useIsUpContractType();
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const isReady = useMemo(() => {
        return !isContractTypeLoading && isMounted && currentContractType;
    }, [currentContractType, isContractTypeLoading, isMounted]);

    const navItems = useMemo(() => {
        const seminarNavItems = [
            { href: '/bitrix/main', label: 'Главная' },
            { href: '/bitrix/client-bid', label: 'Заявка' },
            { href: '/bitrix/participants', label: 'Участники' },
            { href: '/bitrix/products', label: 'Товары' },
            { href: '/bitrix/bx-rq', label: 'Реквизиты' },
        ];

        const upNavItems = [
            { href: '/bitrix/main', label: 'Главная' },
            { href: '/bitrix/client-bid', label: 'Заявка' },
            { href: '/bitrix/products', label: 'Товары' },
            { href: '/bitrix/bx-rq', label: 'Реквизиты' },
        ];

        return isUp ? upNavItems : seminarNavItems;
    }, [isUp]);

    if (!isReady) {
        return null;
    }
    return (
        <div className="flex items-center justify-between">
            <nav className="hidden md:flex items-center space-x-6">
                {isReady &&
                    navItems.map(({ href, label }) => (
                        <Link
                            key={`nav-item-${href}`}
                            href={href}
                            className={cn('transition-colors')}
                        >
                            <motion.div

                                // initial={{ opacity: 0 }}
                                // animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }} // <-- эффект нажатия
                                    transition={{ type: 'spring', stiffness: 100 }}
                                >
                                    <Button
                                        variant={
                                            !pathname.startsWith(href)
                                                ? 'ghost'
                                                : 'default'
                                        }
                                        className="h-7"
                                    >

                                        {label}

                                    </Button>
                                </motion.div>
                            </motion.div>
                        </Link>
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
