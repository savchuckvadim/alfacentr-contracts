import { IAlfaProduct } from '../model/ProductSlice';

export const getProductSum = (products: IAlfaProduct[]) => {
    return products.reduce(
        (sum, product) =>
            sum + Number(product.price) * Number(product.quantity),
        0,
    );
};

export const getProductQuantity = (products: IAlfaProduct[]) => {
    return products.reduce((sum, product) => sum + Number(product.quantity), 0);
};
