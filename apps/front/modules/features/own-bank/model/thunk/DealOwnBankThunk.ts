import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/modules/app/model/store';
import { updateOnlyBitrixDealField } from '@/modules/entities/deal/';
import { saveCurrentToLocalStorage } from '../../lib/utils/save-to-storage';
import { setCurrent, setInitialized } from '../slice/OwnBankSlice';
import { getCurrentByDeal } from '../../lib/utils/current-by-deal';
import { getCurrentByLocalStorage } from '../../lib/utils/current-by-storage';
import { IBXDeal } from '@bitrix/index';


export const updateOwnBank = createAsyncThunk(
    'ownBank/updateOwnBank',

    async (payload: { code: string }, { rejectWithValue, dispatch, getState }) => {
        try {
            const { code } = payload;
            const state = getState() as RootState;

            const field = state.ownBank.field;
            const item = field.list.find(item => item.code === code);
            const fieldBitrixId = field.bitrixId;

            if (!item) {
                return rejectWithValue('Item is required');
            }

            if (!fieldBitrixId) {
                return rejectWithValue('Field bitrixId is required');
            }
            dispatch(updateOnlyBitrixDealField({
                fieldBitrixId,
                value: Number(item.bitrixId),
            }));
            if (item.code) {
                saveCurrentToLocalStorage(item);
            }
            dispatch(setCurrent(item));
            return item;

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




export const initOwnBank = createAsyncThunk(
    'ownBank/initOwnBank',

    async (payload: { deal: IBXDeal | null }, { rejectWithValue, dispatch, getState }) => {
        try {
            const { deal } = payload;
            const state = getState() as RootState;


            let current = null;
            if (deal) {
                current = getCurrentByDeal(deal);
            }
            if (current && current.code) {
                dispatch(setCurrent(current));
            }
            if (!current) {
                current = getCurrentByLocalStorage();
                if (current && current.code) {
                    dispatch(setCurrent(current));

                    //если в сделке не было но было в localstorage то обновляем в сделке
                    const field = state.ownBank.field;
                    const fieldBitrixId = field.bitrixId;
                    const itemBitrixId = current.bitrixId;
                    dispatch(updateOnlyBitrixDealField({
                        fieldBitrixId,
                        value: Number(itemBitrixId),
                    }));

                }
            }
            dispatch(setInitialized());

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
