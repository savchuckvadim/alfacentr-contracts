'use client';
import { useApp } from '@/modules/app';
import { ProductList } from '@/modules/widgetes';

export const ProductPage = () => {
    const { isClient } = useApp();
    if (!isClient) {
        return null;
    }
    return (
        <div className="container  mx-auto">
            <ProductList />
        </div>
    );
};
