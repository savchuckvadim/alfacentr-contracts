import { CustomField } from '@/apps/rq/types/bx-custom-field.type';

/**
 * Утилиты для работы с пользовательскими полями
 */

/**
 * Проверяет, является ли поле пользовательским (начинается с UF_)
 */
export const isCustomField = (key: string): boolean => {
    return key.startsWith('UF_');
};

/**
 * Создает команду для получения информации о пользовательском поле
 */
export const createCustomFieldInfoCommand = (fieldName: string): string => {
    return `field_name_${fieldName}`;
};

/**
 * Создает команду для получения значения пользовательского поля
 */
export const createCustomFieldValueCommand = (fieldName: string): string => {
    return `rq_${fieldName}`;
};

/**
 * Обрабатывает результат получения пользовательского поля
 */
export const processCustomFieldResult = (
    resultValue: any,
    fieldValue: any,
): CustomField => {
    const customField = resultValue;
    customField.EDIT_FORM_LABEL =
        customField.EDIT_FORM_LABEL?.ru || customField.EDIT_FORM_LABEL;
    customField.value = fieldValue;

    return new CustomField(customField);
};

/**
 * Проверяет, существует ли customField в массиве
 */
export const customFieldExists = (
    customFields: CustomField[],
    customField: CustomField,
): boolean => {
    return customFields.some((cf) => cf.ID === customField.ID);
};

/**
 * Добавляет customField в массив, если его там еще нет
 */
export const addCustomFieldIfNotExists = (
    customFields: CustomField[],
    customField: CustomField,
): void => {
    if (!customFieldExists(customFields, customField)) {
        customFields.push(customField);
    }
};
