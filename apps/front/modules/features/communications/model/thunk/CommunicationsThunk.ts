import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BxDealDataKeys } from '@alfa/entities';
import {
    getValidateEmail,
    getValidatePhone,
} from '../../lib/helpers/validate-confirm.helper';

export const validateEmailAndPhone = createAsyncThunk<
    { email: string; phone: string }, // ReturnType
    void, // Arg
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>(
    'communications/ValidateEmailAndPhone',
    async (_, { dispatch, getState, extra }) => {
        // Получаем dispatch и state из деструктуризации
        const state = getState();
        const { getWSClient } = extra;
        const dealData = state.deal.dealData;
        const email = dealData?.find(
            field => field.code === BxDealDataKeys.exchange_doc_email,
        )?.value;
        const phone = dealData?.find(
            field => field.code === BxDealDataKeys.exchange_doc_phone,
        )?.value;

        const emailValidateResult = await getValidateEmail(email as string);
        const phoneValidateResult = (await getValidatePhone(
            phone as string,
        )) as string;

        return { email: emailValidateResult, phone: phoneValidateResult };
    },
);
