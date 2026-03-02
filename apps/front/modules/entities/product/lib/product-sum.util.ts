import { IAlfaProduct } from '../model/ProductSlice';

export const getProductSum = (products: IAlfaProduct[]) => {
    return products.reduce(
        (sum, product) =>
            sum + Number(product.price) * Number(product.quantity),
        0,
    );
};

export const getProductTax = (products: IAlfaProduct[]) => {
    let result = 0;
    products.forEach(product => {
        if (product.taxRate) {
            return (result = product.taxRate);
        }
    });
    return result;
};

export const getProductTaxSum = (products: IAlfaProduct[]) => {
    const result = products.reduce(
        (sum, product) =>
            sum +
            Number(product.price) * Number(product.quantity) -
            Number(product.priceNetto) * Number(product.quantity),
        0,
    );

    return Number(result.toFixed(2));
};
export const getProductQuantity = (products: IAlfaProduct[]) => {
    return products.reduce((sum, product) => sum + Number(product.quantity), 0);
};
