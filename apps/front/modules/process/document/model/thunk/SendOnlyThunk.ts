import { createAsyncThunk } from '@reduxjs/toolkit';
import { BxDealDataKeys, EContractType } from '@alfa/entities';

import { AppDispatch, RootState } from '@/modules/app/model/store';
import { errorHandler } from '@/modules/app/lib/error-handler';

import {
    DocumentGenerateOwnService,
    ISendOnlyResult,
} from '../../lib/services/document-generate-own.service';

/**
 * Повторная отправка уже сформированных документов.
 *
 * Обычная кнопка пересобирает весь пакет: новые файлы, новый расчёт.
 * Здесь не меняется ничего — ни номер договора, ни тема письма, ни сами
 * документы. Нужна, когда письмо ушло не тому человеку: 19.11.2026 по
 * сделке 204568 контакт из заявки вытеснили контакты компании, и робот
 * отправил документы постороннему.
 *
 * Бэкенд перед отправкой проверит, что пакет на месте — для ППК-договоров
 * вместе с приложением ППК, — поставит получателя из заявки и переведёт
 * стадию.
 */
export const documentSendOnly = createAsyncThunk<
    ISendOnlyResult | null,
    void,
    { dispatch: AppDispatch; state: RootState }
>('document/sendOnly', async (_, { getState }) => {
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

        const service = new DocumentGenerateOwnService();

        return await service.sendOnly({
            dealId,
            email,
            name: getField(BxDealDataKeys.exchange_doc_name) || '',
            phone: getField(BxDealDataKeys.exchange_doc_phone) || '',
            userId: Number(state.app.bitrix.user?.ID) || 502,
            contractType: state.contractType.current?.code as EContractType,
            domain: state.app.domain,
        });
    } catch (error) {
        //показываем менеджеру, а не глушим: он нажал кнопку и ждёт ответа
        errorHandler.createCriticalError(
            error instanceof Error
                ? error.message
                : 'Не удалось отправить документы повторно',
        );
        return null;
    }
});
