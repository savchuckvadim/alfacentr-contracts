import { IAlfaProduct } from '@/modules/entities';
import { ProductType, getProductTypeByProductName } from '@alfa/entities';


export const getProductsByType = (
    products: IAlfaProduct[],
    type: ProductType,
): IAlfaProduct[] | null => {

    const filtredProducts = products.filter(
        product =>
            getProductTypeByProductName(product.productName || '') === type,
    );

    return filtredProducts;
};
