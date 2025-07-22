import { ProductCard } from '../../Card/ProductCard';
import { FilterTabs } from '@/modules/shared';
import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';

export const ProductListContent = () => {
    const {
        items: products,
        ppkProducts,
        seminarProducts,
        upProducts,
    } = useAlfaProducts();

    const tabs = [
        {
            label: 'Все',
            value: 'all',
            content: (
                <div className="grid grid-cols-1 gap-4">
                    {products.map(item => (
                        <ProductCard key={item.id} product={item} />
                    ))}
                </div>
            ),
        },
        {
            label: 'ППК',
            value: 'ppk',
            content: (
                <div className="grid grid-cols-1 gap-4">
                    {ppkProducts.map(item => (
                        <ProductCard key={item.id} product={item} />
                    ))}
                </div>
            ),
        },

        {
            label: 'Семинары',
            value: 'seminar',
            content: (
                <div className="grid grid-cols-1 gap-4">
                    {seminarProducts.map(item => (
                        <ProductCard key={item.id} product={item} />
                    ))}
                </div>
            ),
        },

        {
            label: 'УП',
            value: 'up',
            content: (
                <div className="grid grid-cols-1 gap-4">
                    {upProducts.map(item => (
                        <ProductCard key={item.id} product={item} />
                    ))}
                </div>
            ),
        },
    ];
    return (
        <FilterTabs
            gridCols={5}
            className="space-y-4"
            tabsListClassName="grid w-full grid-cols-5"
            tabsContentClassName="space-y-4"
            tabs={tabs}
        />
    );
};
