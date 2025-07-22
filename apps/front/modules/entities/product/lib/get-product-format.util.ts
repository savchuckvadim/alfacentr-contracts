import { IAlfaProduct } from '../model/ProductSlice';
import { getProductFieldByCode } from './product-field.util';

export const getProductFormat = (product: IAlfaProduct): string => {
    const seminarPlaceField = product.fields.find(
        field => field.bitrixId === 'property158',
    );

    if (!seminarPlaceField || !seminarPlaceField.value) {
        return 'Не указано';
    }

    const value = seminarPlaceField.value;

    // Если это объект с value
    if (typeof value === 'object' && value !== null && 'value' in value) {
        const placeValue = (value as any).value;
        return formatPlaceValue(placeValue);
    }

    // Если это строка
    if (typeof value === 'string') {
        return formatPlaceValue(value);
    }

    return 'Не указано';
};

const formatPlaceValue = (value: string): string => {
    const lowerValue = value.toLowerCase();

    if (
        lowerValue.includes('дистанционно') ||
        lowerValue.includes('онлайн') ||
        lowerValue.includes('удаленно')
    ) {
        return 'Дистанционно';
    }

    if (
        lowerValue.includes('очно') ||
        lowerValue.includes('офлайн') ||
        lowerValue.includes('в помещении')
    ) {
        return 'Офлайн';
    }

    return value;
};

export const getProductPrefix = (product: IAlfaProduct): string => {
    // Можно добавить логику для получения префикса продукта
    // Пока возвращаем ID как префикс
    const prifixField = getProductFieldByCode(product, 'PREFIX');
    const value = prifixField?.value as { value: string; valueId: string };

    return value?.value || 'N/A';
};
