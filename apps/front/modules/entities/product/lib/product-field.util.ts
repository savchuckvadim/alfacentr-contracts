import { bxProductData } from '@alfa/entities';
import { IAlfaProduct, IProductField } from '../model/ProductSlice';

type ProductFieldCode = keyof typeof bxProductData;

export const getProductFieldByCode = (
    product: IAlfaProduct,
    code: ProductFieldCode,
) => {
    return product.fields.find(
        field => field.bitrixId === bxProductData[code].bitrixId,
    );
};

export const getProductFieldByCodeValue = (
    product: IAlfaProduct,
    code: ProductFieldCode,
) => {
    const field = getProductFieldByCode(product, code);
    if (!field) return null;
    return getProductFieldValue(field);
};

export const getProductFieldValue = (field: IProductField) => {
    const rawValue = field.value as
        | string
        | string[]
        | {
              value: string;
              valueId: string;
              valueEnum?: string;
          };
    let value = '' as string;

    if (!rawValue)
        return {
            name: field.name,
            value: 'Не указано',
        };
    if (Array.isArray(rawValue)) {
        value = rawValue.join(', ');
    } else if (typeof rawValue === 'object' && 'valueEnum' in rawValue) {
        value = rawValue.valueEnum as string;
    } else if (typeof rawValue === 'object' && 'value' in rawValue) {
        value = rawValue.value as string;
    }
    if (value) {
        if (field.userType === 'DateTime') {
            value = new Date(value).toLocaleDateString();
        }
    }
    const decoded = new DOMParser().parseFromString(value, 'text/html')
        .documentElement.textContent;

    return {
        name: field.name,
        value: decoded,
    };
};

export const filterProductFieldsForDetails = (fields: IProductField[]) => {
    const fieldsOrder = [
        bxProductData.SEMINAR_START_DATE.bitrixId,
        bxProductData.SEMINAR_END_DATE.bitrixId,
        bxProductData.SEMINAR_START_AND_END_DATE.bitrixId,
        bxProductData.TYPE.bitrixId,
        bxProductData.SEMINAR_PLACE.bitrixId,
        bxProductData.SEMINAR_TOPIC.bitrixId,
        bxProductData.SEMINAR_SERVICE_END_DATE.bitrixId,
        bxProductData.SEMINAR_SERVICE_GARANT_DATE.bitrixId,
        bxProductData.SERVICE_NAME_FOR_BILL.bitrixId,
        bxProductData.DOCUMENT_SET.bitrixId,
    ] as string[];

    const fieldsFilter = [
        bxProductData.SEMINAR_TOPIC.bitrixId,
        bxProductData.PREFIX.bitrixId,
    ] as string[];

    const sortedFields = [...fields].sort(
        (a, b) =>
            fieldsOrder.indexOf(a.bitrixId) - fieldsOrder.indexOf(b.bitrixId),
    );

    return sortedFields.filter(field => !fieldsFilter.includes(field.bitrixId));
};
