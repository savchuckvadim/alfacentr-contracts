import { createAsyncThunk } from '@reduxjs/toolkit';
import { Bitrix } from '@bitrix/index';
import { RootState } from '@/modules/app/model/store';
import { DealActDateBitrixId } from '../../type/deal-act-date.type';
import {
    formatDateToBx,
    toLocalIsoDate,
} from '../../lib/utils/formatdate-to-bx.util';

export interface UpdateDealFieldPayload {
    value: Date;
}

export const updateDealActDate = createAsyncThunk<
    string,
    UpdateDealFieldPayload,
    { rejectValue: string }
>(
    'deal-act-date/updateDealActDate',

    async (payload: UpdateDealFieldPayload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const dealId = state.app.bitrix.deal?.ID;

            if (!dealId) {
                return rejectWithValue('Deal ID is required');
            }
            const value = payload.value;

            const formattedDate = value ? formatDateToBx(value as Date) : '';

            const bitrix = Bitrix.getService();
            await bitrix.deal.update(dealId, {
                [DealActDateBitrixId]: formattedDate,
            });

            // Keep Redux state in canonical format (YYYY-MM-DD)
            return toLocalIsoDate(value);
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при обновлении поля сделки';
            return rejectWithValue(errorMessage as string);
        }
    },
);
