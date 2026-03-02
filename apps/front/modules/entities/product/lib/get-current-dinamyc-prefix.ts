import { IAlfaProduct } from '../model/ProductSlice';
import {
    getHasPpk,
    getHasSeminar,
    getHasUpComplect,
    getHasUpVideo,
    getIsPpkProduct,
    getIsSeminarProduct,
    getIsUpProduct,
} from './get-product-type.util';
import { getPrefixByProductName } from '@alfa/entities';

export const getCurrentDinamycPrefix = (products: IAlfaProduct[]) => {
    let prefix = '';
    const hasSeminar = getHasSeminar(products);
    const hasPpk = getHasPpk(products);
    const hasUpComplect = getHasUpComplect(products);
    const hasUpVideo = getHasUpVideo(products);
    const hasUp = hasUpComplect || hasUpVideo;
    if (hasSeminar) {
        const firstSeminarProduct = products.find(product =>
            getIsSeminarProduct(product),
        );
        if (firstSeminarProduct) {
            prefix = getPrefixByProductName(
                firstSeminarProduct.productName || '',
            );
            return prefix;
        }
        return 'СР';
    } else if (!hasSeminar && hasPpk) {
        const firstPpkProduct = products.find(product =>
            getIsPpkProduct(product),
        );
        if (firstPpkProduct) {
            prefix = getPrefixByProductName(firstPpkProduct.productName || '');
            return prefix;
        }
        return 'ППК';
    } else if (!hasSeminar && !hasPpk && hasUp) {
        const firstUpProduct = products.find(product =>
            getIsUpProduct(product),
        );
        if (firstUpProduct) {
            prefix = getPrefixByProductName(firstUpProduct.productName || '');
            return prefix;
        }
        return 'УП';
    } else {
        const firstProduct = products[0];
        if (firstProduct) {
            prefix = getPrefixByProductName(firstProduct.productName || '');
            return prefix;
        }
        return 'СР';
    }
};
