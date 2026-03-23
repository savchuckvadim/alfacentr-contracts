import { createAsyncThunk } from '@reduxjs/toolkit';
import { Bitrix } from '@bitrix/index';
import { RootState } from '@/modules/app/model/store';
import { DealEdoCommentBitrixId } from '../../type/deal-edo-comment.type';

export interface IUpdateDealFieldEdoCommentPayload {
    value: string | null;
}

export const updateDealEdoCommentThunk = createAsyncThunk<
    string,
    IUpdateDealFieldEdoCommentPayload,
    { rejectValue: string }
>(
    'deal-edo-comment/updateDealEdoCommentThunk',

    async (payload: IUpdateDealFieldEdoCommentPayload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const dealId = state.app.bitrix.deal?.ID;

            if (!dealId) {
                return rejectWithValue('Deal ID is required');
            }
            const value: string = payload.value || '';



            const bitrix = Bitrix.getService();
            await bitrix.deal.update(dealId, {
                [DealEdoCommentBitrixId]: value,
            });

            return value;
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при обновлении поля сделки';
            return rejectWithValue(errorMessage as string);
        }
    },
);
