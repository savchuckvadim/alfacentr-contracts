import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BxDealDataKeys } from '@alfa/entities';
import { IDealFieldsData } from '../type/deal-field.type';

import { handleSliceError } from '@/modules/app/lib/thunk-error-handler';
import { updateDealField } from './DealThunk';

export interface IDealState {
    dealData: IDealFieldsData[] | null;
    dealId: number | null;
    loading: boolean;
    error: string | null;
    isUpdating: boolean;
}

const initialState: IDealState = {
    dealData: null,
    dealId: null,
    loading: false,
    error: null,
    isUpdating: false,
};

const dealSlice = createSlice({
    name: 'deal',
    initialState,
    reducers: {
        setDealData: (state, action: PayloadAction<IDealFieldsData[]>) => {
            state.dealData = action.payload;
            state.error = null;
        },
        setDealId: (state, action: PayloadAction<number>) => {
            state.dealId = action.payload;
        },
        updateFieldValue: (
            state,
            action: PayloadAction<{
                fieldKey: BxDealDataKeys;
                value: string | number;
            }>,
        ) => {
            const { fieldKey, value } = action.payload;

            if (state.dealData) {
                const field = state.dealData.find(
                    field => field.code === fieldKey,
                );

                if (field) {
                    (field as IDealFieldsData).value = value.toString() as
                        | string
                        | string[]
                        | number;
                    state.dealData = state.dealData.map(fld =>
                        fld.code === fieldKey ? field : fld,
                    );
                }
            }
        },
        clearDeal: state => {
            state.dealData = null;
            state.dealId = null;
            state.error = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        clearError: state => {
            state.error = null;
        },
    },
    extraReducers: builder => {
        // updateDealField
        builder.addCase(updateDealField.pending, state => {
            state.isUpdating = true;
            state.error = null;
        });
        builder.addCase(updateDealField.fulfilled, state => {
            state.isUpdating = false;
            state.error = null;
        });
        builder.addCase(updateDealField.rejected, (state, action) => {
            state.isUpdating = false;
            state.error = handleSliceError(
                action,
                'Ошибка обновления поля сделки',
            );
        });
    },
});

export const {
    setDealData,
    setDealId,
    updateFieldValue,
    clearDeal,
    setError,
    clearError,
} = dealSlice.actions;

export const dealReducer = dealSlice.reducer;
