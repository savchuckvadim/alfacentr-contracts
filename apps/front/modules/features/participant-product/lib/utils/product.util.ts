import {IAlfaProduct } from '@/modules/entities';
import { ProductType, getProductTypeByProductName } from '@alfa/entities';
import { bxProductData } from '@alfa/entities';

export const getProductsByType = (
    products: IAlfaProduct[],
    type: ProductType,
): IAlfaProduct[] | null => {
    // let searchedType = 'семинар';
    // if (type === 'ppk' || type === 'seminar_ppk') {
    //     searchedType = 'ппк';
    // } else if (type === 'seminar') {
    //     searchedType = 'семинар';
    // } else {
    //     throw new Error('Неизвестный тип продукта УП');
    // }

    // let searchedType = 'СР';
    // if (type === 'ppk' || type === 'seminar_ppk') {
    //     searchedType = 'ППК';
    // } else if (type === 'seminar') {
    //     searchedType = 'СР';
    // } else {
    //     throw new Error('Неизвестный тип продукта УП');
    // }

    // const keyData = bxProductData.TYPE;

    // const filtredProducts = products.filter(product =>
    //     product.fields.find(field => {
    //         if (field.bitrixId === keyData.bitrixId && field.value) {
    //             const fieldValue = field.value as { valueEnum: string };

    //             if (fieldValue.valueEnum) {
    //                 const searchedValue = fieldValue.valueEnum.toLowerCase();
    //                 return searchedValue === searchedType;
    //             }
    //             return false;
    //         }
    //         return false;
    //     }),
    // );

    const filtredProducts = products.filter(
        product =>
            getProductTypeByProductName(product.productName || '') === type,
    );

    return filtredProducts;
};
