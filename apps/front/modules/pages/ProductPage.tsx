'use client';
import { ProductList } from '@/modules/widgetes';

export const ProductPage = () => {
    // const { isClient } = useApp()
    // if (!isClient) {
    //     return null
    // }
    return (
        <div className="max-w-[1600px]  mx-auto">
            <ProductList />
        </div>
    );
};
