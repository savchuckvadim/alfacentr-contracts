import { createAsyncThunk } from '@reduxjs/toolkit';
import { updateDeal } from '../lib/service/deal-update.service';
import { IDealFieldsData } from '../type/deal-field.type';
import { BxDealDataKeys } from '@alfa/entities';
import { RootState } from '@/modules/app/model/store';
import { Bitrix } from '@bitrix/index';

export interface UpdateDealFieldPayload {
    dealId?: number;
    fieldKey: BxDealDataKeys;
    value: string | number;
    field: IDealFieldsData;
}
//UF_CRM_8_DATE_ACT
export const updateDealField = createAsyncThunk(
    'deal/updateDealField',

    async (payload: UpdateDealFieldPayload, { rejectWithValue, getState }) => {
        try {
            const { value, field } = payload;
            const state = getState() as RootState;
            const dealId = payload.dealId || state.app.bitrix.deal?.ID;
            if (!dealId) {
                return rejectWithValue('Deal ID is required');
            }
            // Вызываем сервис обновления сделки
            const res = await updateDeal(dealId, value, field);

            // Возвращаем данные для обновления состояния
            return {
                fieldKey: payload.fieldKey,
                value: payload.value,
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при обновлении поля сделки';
            return rejectWithValue(errorMessage);
        }
    },
);

export const updateOnlyBitrixDealField = createAsyncThunk(
    'deal/updateOnlyBitrixDealField',

    async (payload: { value: string | number, fieldBitrixId: string }, { rejectWithValue, getState }) => {
        try {
            const { value, fieldBitrixId } = payload;
            const state = getState() as RootState;
            const dealId = state.app.bitrix.deal?.ID;
            if (!dealId) {
                return rejectWithValue('Deal ID is required');
            }
            const bitrix = Bitrix.getService();
            await bitrix.deal.update(dealId, {
                [fieldBitrixId]: value,
            });

            // не возвращаем данные для обновления состояния
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при обновлении поля сделки';
            return rejectWithValue(errorMessage);
        }
    },
);

// Thunk для загрузки данных сделки (если понадобится в будущем)
// export const fetchDealData = createAsyncThunk(
//     'deal/fetchDealData',
//     async (dealId: number, { rejectWithValue }) => {
//         try {
//             // Здесь можно добавить логику загрузки данных сделки
//             // Пока возвращаем пустой объект
//             return { dealId };
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при загрузке данных сделки';
//             return rejectWithValue(errorMessage);
//         }
//     }
// );
