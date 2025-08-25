import { IAlfaProduct } from '@/modules/entities';
import { ProductType } from '../type/product-field-code.enum';
// import { bxProductData } from '@alfa/entities';

export const getProductTypeName = (product: IAlfaProduct): string => {
    let type = 'N/A';
    // const keyData = bxProductData.TYPE;

    // product.fields.forEach(field => {
    //     if (field.bitrixId === keyData.bitrixId && field.value) {
    //         const fieldValue = field.value as { valueEnum: string };

    //         if (fieldValue.valueEnum) {
    //             type = fieldValue.valueEnum;
    //         }
    //     }
    // });
    const typeCode = getProductTypeByProductName(
        product.productName || '',
    ) as ProductType;

    switch (typeCode) {
        case 'seminar':
            type = 'семинар';
            break;
        case 'ppk':
            type = 'ппк';
            break;
        case 'up':
            type = 'уп';
            break;
        default:
            type = 'N/A';
    }
    return type;
};

export const getProductType = (product: IAlfaProduct): ProductType => {
    // let type: ProductType = 'seminar';
    // const keyData = bxProductData.TYPE;

    // product.fields.forEach(field => {
    //     if (field.bitrixId === keyData.bitrixId && field.value) {
    //         const fieldValue = field.value as { valueEnum: string };

    //         if (fieldValue.valueEnum) {
    //             const searchedValue = fieldValue.valueEnum.toLowerCase();
    //             if (searchedValue === 'ппк') {
    //                 type = 'ppk';
    //             } else if (searchedValue === 'семинар') {
    //                 type = 'seminar';
    //             } else if (searchedValue === 'семинар_ппк') {
    //                 type = 'seminar_ppk';
    //             } else if (searchedValue === 'уп') {
    //                 type = 'up';
    //             }
    //         }
    //     }
    // });
    // return type;

    return getProductTypeByProductName(product.productName || '');
};

export const getIsPpkProduct = (product: IAlfaProduct): boolean => {
    const result = getProductType(product) === 'ppk';

    return result;
};
export const getIsSeminarProduct = (product: IAlfaProduct): boolean => {
    return getProductType(product) === 'seminar';
};
export const getIsSeminarPpkProduct = (products: IAlfaProduct[]): boolean => {
    return getHasSeminarPpk(products);
};
export const getIsUpProduct = (product: IAlfaProduct): boolean => {
    return getProductType(product) === 'up';
};

export function getPrefixByProductName(productName: string): string {
    const match = productName.match(/\[\]\s*(.*)/);
    return match ? (match[1] as string) : '';
}
export const getProductTypeByProductName = (
    productName: string,
): ProductType => {
    const prefix = getPrefixByProductName(productName);

    if (prefix.includes('СР')) {
        return 'seminar' as ProductType;
    } else if (prefix.includes('ППК')) {
        return 'ppk' as ProductType;
    } else {
        return 'up' as ProductType;
    }
};
export const getHasPpk = (products: IAlfaProduct[]): boolean => {
    return products.some(product =>
        getPrefixByProductName(product.productName || '').includes('ППК'),
    );
};

export const getHasSeminar = (products: IAlfaProduct[]): boolean => {
    return products.some(product =>
        getPrefixByProductName(product.productName || '').includes('СР'),
    );
};
export const getHasSeminarPpk = (products: IAlfaProduct[]): boolean => {
    return getHasPpk(products) && getHasSeminar(products);
};
export const getHasUp = (products: IAlfaProduct[]): boolean => {
    return products.some(product =>
        getPrefixByProductName(product.productName || '').includes('УП'),
    );
};
