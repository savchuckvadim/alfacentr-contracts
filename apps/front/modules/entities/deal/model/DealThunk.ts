import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateDeal } from "../lib/service/deal-update.service";
import { IDealFieldsData } from "../type/deal-field.type";
import { BxDealDataKeys } from "@alfa/entities";

export interface UpdateDealFieldPayload {
    dealId: number;
    fieldKey: BxDealDataKeys;
    value: string;
    field: IDealFieldsData;
}

export const updateDealField = createAsyncThunk(
    'deal/updateDealField',
    async (payload: UpdateDealFieldPayload, { rejectWithValue }) => {
        try {
            const { dealId, value, field } = payload;
            
            // Вызываем сервис обновления сделки
            await updateDeal(dealId, value, field);
            
            // Возвращаем данные для обновления состояния
            return {
                fieldKey: payload.fieldKey,
                value: payload.value
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при обновлении поля сделки';
            return rejectWithValue(errorMessage);
        }
    }
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