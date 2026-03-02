import { IAlfaProduct } from '@/modules/entities';
import {
    getPrefixByProductName,
    getProductTypeByProductName,
    ProductType,
} from '@alfa/entities';
// import { bxProductData } from '@alfa/entities';

export const getProductTypeName = (product: IAlfaProduct): string => {
    let type = 'N/A';

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

// export function getPrefixByProductName(productName: string): string {
//     const match = productName.match(/\[\]\s*(.*)/);
//     return match ? (match[1] as string) : '';
// }
// export const getProductTypeByProductName = (
//     productName: string,
// ): ProductType => {
//     const prefix = getPrefixByProductName(productName);

//     if (prefix.includes('СР') || prefix.includes('СН')) {
//         return 'seminar' as ProductType;
//     } else if (prefix.includes('ППК')) {
//         return 'ppk' as ProductType;
//     } else {
//         return 'up' as ProductType;
//     }
// };
export const getHasPpk = (products: IAlfaProduct[]): boolean => {
    return products.some(product =>
        getPrefixByProductName(product.productName || '').includes('ППК'),
    );
};

export const getHasSeminar = (products: IAlfaProduct[]): boolean => {
    return products.some(
        product =>
            getPrefixByProductName(product.productName || '').includes('СР') ||
            getPrefixByProductName(product.productName || '').includes('СН'),
    );
};
export const getHasSeminarPpk = (products: IAlfaProduct[]): boolean => {
    return getHasPpk(products) && getHasSeminar(products);
};
export const getHasUpComplect = (products: IAlfaProduct[]): boolean => {
    return products.some(product =>
        getPrefixByProductName(product.productName || '').includes('УП'),
    );
};
export const getHasUpVideo = (products: IAlfaProduct[]): boolean => {
    return products.some(product =>
        getPrefixByProductName(product.productName || '').includes('УВ'),
    );
};
