import { createAsyncThunk } from '@reduxjs/toolkit';
import { BxDealDataKeys, EContractType } from '@alfa/entities';

import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';

import { DocumentGenerateOwnService } from '../../lib/services/document-generate-own.service';
import {
    sendOnlyDone,
    sendOnlyFailed,
    sendOnlyStarted,
} from '../slice/SendOnlySlice';

/**
 * Повторная отправка уже сформированных документов.
 *
 * Обычная кнопка пересобирает весь пакет: новые файлы, новый расчёт.
 * Здесь не меняется ничего — ни номер договора, ни тема письма, ни сами
 * документы. Нужна, когда письмо ушло не тому человеку: 19.11.2026 по
 * сделке 204568 контакт из заявки вытеснили контакты компании, и робот
 * отправил документы постороннему.
 *
 * Работа идёт в очереди: отправка делает три обращения к порталу, и
 * каждое может упереться в таймаут. Результат приходит по веб-сокету
 * событием document-send-only:done — до тех пор кнопка ждёт.
 */
export const documentSendOnly = createAsyncThunk<
    boolean,
    void,
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>('document/sendOnly', async (_, { getState, dispatch, extra }) => {
    try {
        const state = getState();

        const dealId = Number(state.app.bitrix.deal?.ID);
        if (!dealId) throw new Error('Сделка не определена');

        const getField = (code: BxDealDataKeys) =>
            state.deal.dealData?.find(field => field.code === code)?.value as
                | string
                | undefined;

        const email = getField(BxDealDataKeys.exchange_doc_email);
        if (!email) {
            throw new Error(
                'В заявке не указан e-mail для обмена документами — отправлять некуда',
            );
        }

        dispatch(sendOnlyStarted());

        const service = new DocumentGenerateOwnService();

        await service.sendOnly({
            dealId,
            email,
            name: getField(BxDealDataKeys.exchange_doc_name) || '',
            phone: getField(BxDealDataKeys.exchange_doc_phone) || '',
            userId: Number(state.app.bitrix.user?.ID) || 502,
            contractType: state.contractType.current?.code as EContractType,
            domain: state.app.domain,
            //без сокета результат не вернётся, и кнопка останется ждать:
            //сама отправка идёт в очереди
            socketId: extra.getWSClient()?.id || '',
        });

        return true;
    } catch (error) {
        dispatch(
            sendOnlyFailed(
                error instanceof Error
                    ? error.message
                    : 'Не удалось отправить документы повторно',
            ),
        );
        return false;
    }
});

/** Ответ из очереди: отправка прошла, не прошла или прошла не полностью */
export const documentSendOnlyDone = (data: unknown) => {
    const payload = (data || {}) as {
        sent?: boolean;
        missing?: { name: string; bitrixId: string }[];
        error?: string | null;
    };

    return sendOnlyDone({
        sent: Boolean(payload.sent),
        missing: payload.missing || [],
        error: payload.error || null,
    });
};
