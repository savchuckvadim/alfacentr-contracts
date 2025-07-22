import { IAlfaProduct } from '@/modules/entities';
import { ProductType } from '../type/product-field-code.enum';
import { bxProductData } from '@alfa/entities';

export const getProductTypeName = (product: IAlfaProduct): string => {
    let type = 'N/A';
    const keyData = bxProductData.TYPE;

    product.fields.forEach(field => {
        if (field.bitrixId === keyData.bitrixId && field.value) {
            const fieldValue = field.value as { valueEnum: string };

            if (fieldValue.valueEnum) {
                type = fieldValue.valueEnum;
            }
        }
    });
    return type;
};

export const getProductType = (product: IAlfaProduct): ProductType => {
    let type: ProductType = 'seminar';
    const keyData = bxProductData.TYPE;

    product.fields.forEach(field => {
        if (field.bitrixId === keyData.bitrixId && field.value) {
            const fieldValue = field.value as { valueEnum: string };

            if (fieldValue.valueEnum) {
                const searchedValue = fieldValue.valueEnum.toLowerCase();
                if (searchedValue === 'ппк') {
                    type = 'ppk';
                } else if (searchedValue === 'семинар') {
                    type = 'seminar';
                } else if (searchedValue === 'семинар_ппк') {
                    type = 'seminar_ppk';
                } else if (searchedValue === 'уп') {
                    type = 'up';
                }
            }
        }
    });
    return type;
};

export const getIsPpkProduct = (product: IAlfaProduct): boolean => {
    return getProductType(product) === 'ppk';
};
export const getIsSeminarProduct = (product: IAlfaProduct): boolean => {
    return getProductType(product) === 'seminar';
};
export const getIsSeminarPpkProduct = (product: IAlfaProduct): boolean => {
    return getProductType(product) === 'seminar_ppk';
};
export const getIsUpProduct = (product: IAlfaProduct): boolean => {
    return getProductType(product) === 'up';
};
