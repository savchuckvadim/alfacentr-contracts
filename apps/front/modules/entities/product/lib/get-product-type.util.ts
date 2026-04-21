import { IAlfaProduct } from '@/modules/entities';
import {
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
        case 'up_video':
        case 'up_complect':
            type = 'уп';
            break;
        case 'up_special':
            type = 'спецпродукт';
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

export const getIsUpSpecialProduct = (product: IAlfaProduct): boolean => {
    const type = getProductType(product);
    return type === 'up_special';
};
export const getIsUpVideoProduct = (product: IAlfaProduct): boolean => {
    const type = getProductType(product);
    return type === 'up_video';
};
export const getIsUpComplectProduct = (product: IAlfaProduct): boolean => {
    const type = getProductType(product);
    return type === 'up_complect';
};

export const getIsUpProduct = (product: IAlfaProduct): boolean => {

    const result = getIsUpComplectProduct(product) ||
        getIsUpVideoProduct(product) ||
        getIsUpSpecialProduct(product);

    return result;
};


export const getHasPpk = (products: IAlfaProduct[]): boolean => {
    return products.some(product => getIsPpkProduct(product));
    // return products.some(product =>
    //     getPrefixByProductName(product.productName || '').includes('ППК'),
    // );
};

export const getHasSeminar = (products: IAlfaProduct[]): boolean => {
    return products.some(product => getIsSeminarProduct(product));
    // return products.some(
    //     product =>
    //         getPrefixByProductName(product.productName || '').includes('СР') ||
    //         getPrefixByProductName(product.productName || '').includes('СН'),
    // );
};
export const getHasSeminarPpk = (products: IAlfaProduct[]): boolean => {
    return getHasPpk(products) && getHasSeminar(products);
};
export const getHasUpComplect = (products: IAlfaProduct[]): boolean => {
    return products.some(product => getIsUpComplectProduct(product));
    // return products.some(product =>
    //     getPrefixByProductName(product.productName || '').includes('УП'),
    // );
};
export const getHasUpVideo = (products: IAlfaProduct[]): boolean => {
    return products.some(product => getIsUpVideoProduct(product));
    // return products.some(product =>
    //     getPrefixByProductName(product.productName || '').includes('УВ'),
    // );
};
export const getHasUpSpecial = (products: IAlfaProduct[]): boolean => {
    return products.some(product => getIsUpSpecialProduct(product));
    // return products.some(product =>
    //     getPrefixByProductName(product.productName || '').includes('УС'),
    // );
};

export const getHasUp = (products: IAlfaProduct[]): boolean => {
    return getHasUpComplect(products) || getHasUpVideo(products) || getHasUpSpecial(products);
};
