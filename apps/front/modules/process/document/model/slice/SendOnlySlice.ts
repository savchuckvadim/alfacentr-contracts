import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ISendOnlyMissingField {
    name: string;
    bitrixId: string;
}

export interface ISendOnlyState {
    /** Задача в очереди, ждём ответа по веб-сокету */
    isSending: boolean;
    /** Письмо ушло */
    isSent: boolean;
    /** Документы, которых не хватило — предупреждение, не отказ */
    missing: ISendOnlyMissingField[];
    /** Отправка не состоялась: портал недоступен или упал вызов */
    error: string | null;
}

const initialState: ISendOnlyState = {
    isSending: false,
    isSent: false,
    missing: [],
    error: null,
};

/**
 * Повторная отправка документов.
 *
 * Состояние в сторе, а не в компоненте: результат приходит по
 * веб-сокету отдельным событием, уже после того как запрос ответил.
 * 20.11.2026 портал сорок минут отдавал пятисотки, отправка падала на
 * смене стадии — а менеджер видел «отправлено», потому что ответ
 * приходил до настоящей работы.
 */
const sendOnlySlice = createSlice({
    name: 'sendOnly',
    initialState,
    reducers: {
        sendOnlyStarted: (state: ISendOnlyState) => {
            state.isSending = true;
            state.isSent = false;
            state.missing = [];
            state.error = null;
        },

        sendOnlyDone: (
            state: ISendOnlyState,
            action: PayloadAction<{
                sent: boolean;
                missing?: ISendOnlyMissingField[];
                error?: string | null;
            }>,
        ) => {
            state.isSending = false;
            state.isSent = action.payload.sent;
            state.missing = action.payload.missing || [];
            state.error = action.payload.error || null;
        },

        /** Запрос не дошёл до очереди — до веб-сокета дело не дойдёт */
        sendOnlyFailed: (
            state: ISendOnlyState,
            action: PayloadAction<string>,
        ) => {
            state.isSending = false;
            state.isSent = false;
            state.error = action.payload;
        },

        sendOnlyReset: () => initialState,
    },
});

export const {
    sendOnlyStarted,
    sendOnlyDone,
    sendOnlyFailed,
    sendOnlyReset,
} = sendOnlySlice.actions;

export const sendOnlyReducer = sendOnlySlice.reducer;
