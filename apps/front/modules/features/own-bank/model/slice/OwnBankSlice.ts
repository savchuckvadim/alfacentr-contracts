import { ALFA_RQ_DATA, documentFields, EnumDealDocumentFieldCode, TFieldItem } from "@alfa/entities";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { updateOwnBank } from "../thunk/DealOwnBankThunk";
import { handleSliceError } from "@/modules/app/lib/thunk-error-handler";
import { TOwnBanksData, TOwnBankValue } from "../../type/save.type";

export interface OwnBankState {
    current: TFieldItem | null;

    field: typeof documentFields[EnumDealDocumentFieldCode.BANK];
    banks: TOwnBanksData;
    bank: TOwnBankValue | null;
    isLoading: boolean;
    isFetched: boolean;
    error: string | null;
}

export const initialState: OwnBankState = {
    current: null,
    field: documentFields[EnumDealDocumentFieldCode.BANK],
    banks: ALFA_RQ_DATA,
    bank: null,
    isLoading: true,
    isFetched: false,
    error: null,
};

export const ownBankSlice = createSlice({
    name: 'ownBank',
    initialState,
    reducers: {
        setCurrent: (state: OwnBankState, action: PayloadAction<TFieldItem>) => {
            state.current = action.payload;

            const code = action.payload.code;
            const currentBank = state.banks[code as keyof typeof state.banks];
            if (currentBank) {
                state.bank = currentBank;
            } else {
                state.bank = null;
            }
            state.isLoading = false;
            state.error = null;
        },
        setInitialized: (state: OwnBankState) => {
            state.isLoading = false;
            state.isFetched = true;
        },

    },
    extraReducers: (builder) => {
        builder.addCase(updateOwnBank.pending, (state,) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(updateOwnBank.rejected, (state, action) => {
            state.isLoading = false;
            state.isFetched = true;
            state.error = handleSliceError(action, 'Ошибка обновления банка');
        });
    },
});

export const { setCurrent, setInitialized } = ownBankSlice.actions;

export const ownBankReducer = ownBankSlice.reducer;
