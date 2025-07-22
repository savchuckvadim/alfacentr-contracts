import { IBXProduct } from '@bitrix/index';
import { IAlfaProduct } from '../model/ProductSlice';
import { getProductFieldByCodeValue } from './product-field.util';
import { getProductType } from './get-product-type.util';

export const getCurrentDinamycPrefix = (products: IAlfaProduct[]) => {
    let prefix = '';
    products.forEach(product => {
        if (prefix) return;

        const productType = getProductType(product);

        if (productType === 'ppk') {
            const productField = getProductFieldByCodeValue(product, 'PREFIX');

            if (
                productField &&
                productField.value &&
                productField.value !== 'Не указано'
            ) {
                prefix = productField.value as string;
            }
        }
    });

    if (!prefix) {
        products.forEach(product => {
            if (prefix) return;
            const productField = getProductFieldByCodeValue(product, 'PREFIX');
            if (
                productField &&
                productField.value &&
                productField.value !== 'Не указано'
            ) {
                prefix = productField.value as string;
            }
        });
    }
    return prefix;
};
