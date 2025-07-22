import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';
import { SimpleStatisticsCards, SimpleStatisticsProps } from '@/modules/shared';
import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';

export const ProductSimpleStatistics = () => {
    const { loading, items, ppkProducts } = useAlfaProducts();
    const withoutQuantityProducts = items.filter(
        product => product.quantity === 0,
    );
    const cards = [
        {
            title: 'Всего товаров',
            value: items.length,
            color: 'blue',
        },
        {
            title: 'С ППК',
            value: ppkProducts.length,
            color: 'green',
        },
        {
            title: 'Без ППК',
            value: ppkProducts.length,
            color: 'orange',
        },
        {
            title: 'Требуют внимания',
            value: withoutQuantityProducts.length,
            color: 'red',
        },
    ] as SimpleStatisticsProps[];

    return loading ? (
        <MicroPreloader />
    ) : (
        <SimpleStatisticsCards cards={cards} />
    );
};
