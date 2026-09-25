import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BxDealDataKeys } from '@alfa/entities';
import { getValidateEmail } from '../../lib/helpers/validate-confirm.helper';

/**
 * Проверка email сделки через бэк.
 *
 * Телефона здесь нет намеренно: его формат приложение не проверяет
 * (решение заказчика, сентябрь 2026) — менеджеры пишут добавочные и
 * несколько номеров через запятую, и это нормальная рабочая строка.
 */
export const validateEmail = createAsyncThunk<
    { email: string }, // ReturnType
    void, // Arg
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>('communications/ValidateEmail', async (_, { getState }) => {
    const state = getState();
    const dealData = state.deal.dealData;
    const email = dealData?.find(
        field => field.code === BxDealDataKeys.exchange_doc_email,
    )?.value;

    const emailValidateResult = await getValidateEmail(email as string);

    return { email: emailValidateResult };
});
