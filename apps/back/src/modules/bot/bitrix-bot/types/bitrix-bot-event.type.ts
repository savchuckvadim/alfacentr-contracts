/**
 * Событие чат-бота приходит form-urlencoded со скобочной нотацией:
 * data[PARAMS][DIALOG_ID], data[USER][ID] и так далее. express.urlencoded с
 * extended: true разбирает это во вложенные объекты, но типы у всего строковые
 * и часть полей может отсутствовать — поэтому описываем как есть, без
 * class-validator: жёсткая валидация чужого формата ломает приём событий.
 */
export interface IBitrixBotEventBody {
    event?: string;
    data?: {
        BOT?: Record<string, { BOT_ID?: string; CLIENT_ID?: string }>;
        PARAMS?: {
            DIALOG_ID?: string;
            CHAT_ID?: string;
            MESSAGE_ID?: string;
            MESSAGE?: string;
            FROM_USER_ID?: string;
            TO_USER_ID?: string;
            CHAT_TYPE?: string;
        };
        USER?: {
            ID?: string;
            NAME?: string;
            LAST_NAME?: string;
            FIRST_NAME?: string;
            IS_BOT?: string | boolean;
        };
    };
    auth?: Record<string, unknown>;
}

/** Разобранное событие сообщения — то, с чем работает сценарий */
export interface IBitrixBotMessage {
    event: string;
    dialogId: string;
    messageId: string;
    text: string;
    authorId: number;
    authorName: string;
    isFromBot: boolean;
    botId: number | null;
}

export const BITRIX_BOT_EVENTS = {
    messageAdd: 'ONIMBOTMESSAGEADD',
    joinChat: 'ONIMBOTJOINCHAT',
    botDelete: 'ONIMBOTDELETE',
} as const;
