'use client';

import React, { useMemo } from 'react';
import type { SummaryStatisticsProps } from './types';

/**
 * Компонент для отображения статистики (товары, участники, сумма)
 */
export const SummaryStatistics: React.FC<SummaryStatisticsProps> = ({
    totalProductsCount,
    participantsCount,
    totalSum,
    isUp,
}) => {
    const formatCurrency = (value: number): string => {
        return value.toLocaleString('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };
    const statisticsItems = useMemo(() => {
        const result: Array<{
            label: string;
            value: string | number;
            valueClassName?: string;
        }> = [
            {
                label: 'Всего товаров',
                value: totalProductsCount,
            },
        ];

        if (!isUp) {
            result.push({
                label: 'Участников',
                value: participantsCount,
                valueClassName: 'text-blue-600',
            });
        }
        result.push({
            label: 'Общая сумма',
            value: formatCurrency(totalSum),
            valueClassName: 'text-green-600',
        });
        return result;
    }, [totalProductsCount, participantsCount, totalSum, isUp]);

    return (
        <section className="space-y-4" aria-label="Статистика">
            {statisticsItems.map((item, index) => (
                <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                    <span className="text-foreground/70">{item.label}:</span>
                    <span
                        className={item.valueClassName || 'font-semibold'}
                        aria-label={`${item.label} - ${item.value}`}
                    >
                        {item.value}
                    </span>
                </div>
            ))}
        </section>
    );
};
