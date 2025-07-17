import { ProductFullStatisticItem } from "./components/ProductFullStatisticItem"
import { useProductStatistics } from "./hook/useProductStatistics"

export const ProductsFullStatistics = () => {

    const {
        totalPpkProducts,
        totalSeminarProducts,
        totalUpProducts,
        totalAssignedParticipants,
        totalUnassignedParticipants,
        totalTopics, topicsWithDeficit,
        topicsWithSurplus, balancedTopics,
        totalSum,
        ppkSum,
        seminarSum
    } = useProductStatistics()

    const statistics = [
        {
            title: 'Продукты',
            items: [
                { title: 'ППК', value: totalPpkProducts, isDestructive: true },
                { title: 'Семинары', value: totalSeminarProducts, isDestructive: false },
                { title: 'УП', value: totalUpProducts, isDestructive: false }
            ]
        },
        {
            title: 'Участники',
            items: [
                { title: 'Назначены', value: totalAssignedParticipants, isDestructive: false },
                { title: 'Без мест', value: totalUnassignedParticipants, isDestructive: true }
            ]
        },
        {
            title: 'Темы ППК',
            items: [
                { title: 'Всего тем', value: totalTopics, isDestructive: false },
                { title: 'Недостаток', value: topicsWithDeficit, isDestructive: true },
                { title: 'Избыток', value: topicsWithSurplus, isDestructive: false }
            ]
        },
        {
            title: 'Общая статистика',
            items: [
                { title: 'Сбалансировано', value: balancedTopics, isDestructive: false },
                { title: 'Проблемы', value: topicsWithDeficit + topicsWithSurplus, isDestructive: true }
            ]
        },
        {
            title: 'Финансы',
            items: [
                { title: 'Общая сумма', value: totalSum, isDestructive: false },
                { title: 'ППК', value: ppkSum, isDestructive: true },
                { title: 'Семинары', value: seminarSum, isDestructive: false }
            ]
        }
    ]
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Статистика продуктов */}
        {statistics.map((stat) => (
            <ProductFullStatisticItem
                key={stat.title}
                title={stat.title}
                items={stat.items}
             
            />
        ))}
    </div >

}