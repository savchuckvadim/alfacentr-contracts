import { ProductType } from './product.type';

export const getProductTypeByProductName = (
    productName: string,
): ProductType => {
    const prefix = getPrefixByProductName(productName);

    if (prefix.includes('СР') || prefix.includes('СН')) {
        return 'seminar' as ProductType;
    } else if (prefix.includes('ППК')) {
        return 'ppk' as ProductType;
    } else {
        return 'up' as ProductType;
    }
};

export function getPrefixByProductName(productName: string): string {
    const match = productName.match(/\[\]\s*(.*)/);
    return match ? (match[1] as string) : '';
}
