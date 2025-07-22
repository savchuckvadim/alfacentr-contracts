import { IAlfaProduct } from '../model/ProductSlice';

export const getCompanyFields = (product: IAlfaProduct) => {
    return product.fields.filter(field => field.userType === 'company');
};

export const getProductFields = (product: IAlfaProduct) => {
    const { price, quantity, productName } = product;
    return product.fields.filter(field => field.userType === 'product');
};
