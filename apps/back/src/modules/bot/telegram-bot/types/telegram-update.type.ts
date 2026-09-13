/** Минимум полей обновления Телеграма, которые нам нужны */
export interface ITelegramUpdate {
    update_id?: number;
    message?: ITelegramMessage;
    callback_query?: ITelegramCallbackQuery;
}

export interface ITelegramMessage {
    message_id?: number;
    from?: ITelegramUser;
    chat?: { id?: number; type?: string };
    text?: string;
    reply_to_message?: ITelegramMessage;
}

export interface ITelegramUser {
    id?: number;
    is_bot?: boolean;
    first_name?: string;
    last_name?: string;
    username?: string;
}

export interface ITelegramCallbackQuery {
    id?: string;
    from?: ITelegramUser;
    message?: ITelegramMessage;
    data?: string;
}

export interface ITelegramInlineButton {
    text: string;
    callback_data: string;
}

/**
 * Действия оператора. Коды короткие намеренно: Телеграм ограничивает
 * callback_data 64 байтами, а туда же уходит идентификатор заявки.
 */
export const TG_ACTION = {
    reply: 'r',
    delegate: 'd',
    ignore: 'i',
    done: 'k',
    /** делегировать конкретному: dg:<bitrixUserId>:<requestId> */
    delegateTo: 'dg',
    cancel: 'c',
} as const;

export type TTelegramAction = (typeof TG_ACTION)[keyof typeof TG_ACTION];
