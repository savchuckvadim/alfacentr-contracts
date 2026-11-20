/**
 * Сообщение об ошибке вызова портала — для телеграма.
 *
 * Раньше в канал уходило только тело ответа Битрикса, без метода и без
 * данных запроса. 18.11.2026 пришло «Поле "Рабочий e-mail" содержит
 * некорректный адрес» — и по сообщению нельзя было понять ни какой это
 * метод, ни какая сделка, ни чей это адрес. Разбор упирался в чтение
 * логов контейнера за сутки.
 *
 * Теперь в сообщении есть метод, портал и ключевые поля запроса. Данные
 * режем: в запросе бывают списки товаров и участников на килобайты, а
 * телеграм такое не покажет.
 */

/** Сколько символов данных запроса показываем */
export const MAX_PAYLOAD_LENGTH = 400;

/**
 * Поля, по которым ищем сущность в данных запроса. Порядок важен: сначала
 * прямые идентификаторы, потом то, по чему можно опознать запись
 */
const ID_KEYS = [
    'ID',
    'id',
    'dealId',
    'DEAL_ID',
    'entityId',
    'ENTITY_ID',
    'ownerId',
    'ownerID',
];

const asPlainText = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return '';
};

/**
 * Вытаскивает идентификатор сущности из данных запроса.
 *
 * Нужен именно он: по номеру сделки или элемента сразу открывается
 * карточка, а дальше видно и заявку, и кто её вёл
 */
export const extractEntityId = (data: unknown): string => {
    if (!data || typeof data !== 'object') return '';
    const payload = data as Record<string, unknown>;

    for (const key of ID_KEYS) {
        const value = asPlainText(payload[key]);
        if (value) return `${key}=${value}`;
    }

    //у crm.item.* идентификатор лежит внутри fields
    const fields = payload.fields;
    if (fields && typeof fields === 'object') {
        for (const key of ID_KEYS) {
            const value = asPlainText(
                (fields as Record<string, unknown>)[key],
            );
            if (value) return `fields.${key}=${value}`;
        }
    }

    return '';
};

/** Короткая выжимка данных запроса: без неё непонятно, что именно отвергли */
export const summarizePayload = (data: unknown): string => {
    if (data === null || data === undefined) return '';

    let text: string;
    try {
        text = JSON.stringify(data);
    } catch {
        //в данных бывают циклические ссылки — не роняем отправку сообщения
        return '';
    }

    if (!text || text === '{}') return '';
    return text.length > MAX_PAYLOAD_LENGTH
        ? `${text.slice(0, MAX_PAYLOAD_LENGTH)}…`
        : text;
};

/** Тело ответа портала, если оно есть; иначе текст самой ошибки */
export const describeError = (error: unknown): string => {
    const response = (error as { response?: { data?: unknown } })?.response
        ?.data;

    if (response !== undefined && response !== null) {
        try {
            return JSON.stringify(response);
        } catch {
            //ответ с циклической ссылкой: показать его нечем, но и терять
            //сообщение из-за этого не стоит
            return '[ответ портала не читается]';
        }
    }

    if (error instanceof Error) return error.message;

    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
};

export interface BitrixErrorContext {
    method: string;
    domain: string;
    data?: unknown;
    /**
     * Чем занимались, когда упали: «приём заявки, сделка 204836».
     *
     * Нужен там, где номера сделки нет в самом запросе. Так случилось
     * 20.11.2026 с crm.contact.add: портал отверг адрес, а по сообщению
     * нельзя было понять, к какой заявке относится контакт
     */
    scope?: string;
}

/** Собирает сообщение для телеграма: что вызывали, куда, с чем и что ответили */
export const buildBitrixErrorMessage = (
    context: BitrixErrorContext,
    error: unknown,
): string => {
    const lines = [`Bitrix call error: ${context.method}`];

    if (context.scope) lines.push(`где: ${context.scope}`);
    if (context.domain) lines.push(`портал: ${context.domain}`);

    const entityId = extractEntityId(context.data);
    if (entityId) lines.push(`сущность: ${entityId}`);

    const payload = summarizePayload(context.data);
    if (payload) lines.push(`запрос: ${payload}`);

    lines.push(`ответ: ${describeError(error)}`);

    return lines.join('\n');
};
