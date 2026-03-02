import { memo } from 'framer-motion';
import { ProductFullStatisticItem } from './components/ProductFullStatisticItem';
import { useProductStatistics } from './hook/useProductStatistics';
import { useMemo } from 'react';
import { useIsUpContractType } from '@/modules/features';

export const ProductsFullStatistics = memo(function ProductsFullStatistics() {
    const {
        totalPpkProducts,
        totalSeminarProducts,
        totalUpProducts,
        totalAssignedParticipants,
        totalUnassignedParticipants,
        totalTopics,
        topicsWithDeficit,
        topicsWithSurplus,
        balancedTopics,
        totalSum,
        ppkSum,
        seminarSum,
    } = useProductStatistics();
    const { isUp } = useIsUpContractType();
    const getStatistics = () => {
        const statistics = [
            {
                title: 'Продукты',
                items: [
                    {
                        title: 'ППК',
                        value: totalPpkProducts,
                        isDestructive: true,
                    },
                    {
                        title: 'Семинары',
                        value: totalSeminarProducts,
                        isDestructive: false,
                    },
                    {
                        title: 'УП',
                        value: totalUpProducts,
                        isDestructive: false,
                    },
                ],
                isUp: false,
            },
            {
                title: 'Участники',
                items: [
                    {
                        title: 'Назначены',
                        value: totalAssignedParticipants,
                        isDestructive: false,
                    },
                    {
                        title: 'Без мест',
                        value: totalUnassignedParticipants,
                        isDestructive: true,
                    },
                ],
                isUp: false,
            },
            {
                title: 'Темы ППК',
                items: [
                    {
                        title: 'Всего тем',
                        value: totalTopics,
                        isDestructive: false,
                    },
                    {
                        title: 'Недостаток',
                        value: topicsWithDeficit,
                        isDestructive: true,
                    },
                    {
                        title: 'Избыток',
                        value: topicsWithSurplus,
                        isDestructive: false,
                    },
                ],
                isUp: false,
            },
            {
                title: 'Общая статистика',
                items: [
                    {
                        title: 'Сбалансировано',
                        value: balancedTopics,
                        isDestructive: false,
                    },
                    {
                        title: 'Проблемы',
                        value: topicsWithDeficit + topicsWithSurplus,
                        isDestructive: true,
                    },
                ],
                isUp: false,
            },
            {
                title: 'Финансы',
                items: [
                    {
                        title: 'Общая сумма',
                        value: totalSum,
                        isDestructive: false,
                    },
                    { title: 'ППК', value: ppkSum, isDestructive: true },
                    {
                        title: 'Семинары',
                        value: seminarSum,
                        isDestructive: false,
                    },
                ],
                isUp: true,
            },
        ];
        return statistics;
    };
    const statistics = useMemo(
        () => getStatistics(),
        [
            totalPpkProducts,
            totalSeminarProducts,
            totalUpProducts,
            totalAssignedParticipants,
            totalUnassignedParticipants,
            totalTopics,
            topicsWithDeficit,
            topicsWithSurplus,
            balancedTopics,
            totalSum,
            ppkSum,
            seminarSum,
        ],
    );
    return (
        <>
            {!isUp && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Статистика продуктов */}
                    {statistics.map((stat, index) => (
                        <ProductFullStatisticItem
                            key={`product-full-statistic-item-${index}`}
                            title={stat.title}
                            items={stat.items}
                        />
                    ))}
                </div>
            )}
        </>
    );
});
