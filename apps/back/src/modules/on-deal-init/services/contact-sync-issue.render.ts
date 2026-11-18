/**
 * Сообщение менеджеру о том, что контакт для отправки документов не создан.
 *
 * Приём намеренно не падает из-за синхронизации контакта — заявка важнее.
 * Но раньше отказ проглатывался совсем: товары и участники на месте,
 * контакта нет, письмо отправить некому, и никто об этом не знает до
 * звонка клиента. 18.11.2026 портал отверг адрес («Поле "Рабочий e-mail"
 * содержит некорректный адрес»), и найти сделку удалось только по логам
 * контейнера.
 *
 * Это не валидация: мы ничего не запрещаем и не проверяем сами — клиент
 * просил свои проверки снять. Мы лишь не скрываем отказ портала.
 */

/** Длинные ответы портала в комментарий не тащим */
const MAX_REASON_LENGTH = 300;

export const extractContactSyncReason = (error: unknown): string => {
    const data = (error as { response?: { data?: unknown } })?.response?.data;

    //у портала человекочитаемая причина лежит в error_description
    if (data && typeof data === 'object') {
        const description = (data as Record<string, unknown>)
            .error_description;
        if (typeof description === 'string' && description.trim()) {
            return description.trim();
        }
    }

    if (error instanceof Error && error.message) return error.message;

    return 'портал не принял данные';
};

/**
 * Комментарий в сделку. HTML-теги портала (<br>) убираем: в комментарии
 * таймлайна они показываются как есть
 */
export const renderContactSyncIssue = (
    email: string,
    error: unknown,
): string => {
    const reason = extractContactSyncReason(error)
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_REASON_LENGTH);

    const lines = [
        '⚠️ [B]Контакт для отправки документов не создан[/B]',
        email ? `Адрес из заявки: ${email}` : 'Адрес в заявке не указан',
        `Портал ответил: ${reason}`,
        'Письмо по этой заявке отправить не получится — проверьте адрес и заведите контакт вручную.',
    ];

    return lines.join(' \n');
};
