/**
 * Проверка номера документа перед генерацией.
 *
 * Номер приходит из браузера менеджера: фронт держит его в стейте, а до
 * ответа сервера там ноль. Если менеджер успел нажать генерацию раньше
 * ответа, на бэкенд приходит counter = "0". Этот ноль уходил в заголовок
 * документа, и Битрикс отвечал «No value for required placeholder
 * DocumentTitle», роняя пакет команд на середине: часть документов
 * создавалась, часть нет (сделка 198090 от 12.10.2026).
 *
 * Прежняя защита `dto.documentCounter || '1'` не срабатывала дважды: строка
 * "0" для неё непустая, а подстановка единицы вместо настоящего номера
 * отправила бы клиенту документ с чужим номером. Поэтому здесь отказ, а не
 * значение по умолчанию.
 */

/** Номер считается годным, если это целое число больше нуля */
export const isValidDocumentCounter = (value: unknown): boolean => {
    if (typeof value !== 'string' && typeof value !== 'number') return false;

    const text = String(value).trim();
    if (!/^\d+$/.test(text)) return false;

    return Number(text) > 0;
};

/** Текст ошибки с номером сделки: без него такие случаи ищутся вручную */
export const documentCounterErrorMessage = (
    value: unknown,
    dealId: number | string,
): string =>
    `Генерация документов остановлена: номер договора не получен (counter=${JSON.stringify(
        value,
    )}), сделка ${dealId}. Обновите страницу приложения и повторите.`;

export class DocumentCounterMissingError extends Error {
    constructor(value: unknown, dealId: number | string) {
        super(documentCounterErrorMessage(value, dealId));
        this.name = 'DocumentCounterMissingError';
    }
}

export const assertDocumentCounter = (
    value: unknown,
    dealId: number | string,
): void => {
    if (!isValidDocumentCounter(value)) {
        throw new DocumentCounterMissingError(value, dealId);
    }
};
