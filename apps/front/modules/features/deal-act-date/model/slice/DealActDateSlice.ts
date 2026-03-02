import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateDealActDate } from '../thunk/update-deal-act-date.thunk';
import { IDealActDateState } from '../../type/deal-act-date.type';

const initialState: IDealActDateState = {
    dealActDate: null,
    error: null,
    isUpdating: false,
};

const dealActDateSlice = createSlice({
    name: 'dealActDate',
    initialState,
    reducers: {
        setDealActDate: (
            state: IDealActDateState,
            action: PayloadAction<string>,
        ) => {
            state.dealActDate = action.payload;
        },
    },
    extraReducers: builder => {
        builder.addCase(
            updateDealActDate.fulfilled,
            (state: IDealActDateState, action: PayloadAction<string>) => {
                state.dealActDate = action.payload as string;
                state.error = null;
                state.isUpdating = false;
            },
        );
        builder.addCase(
            updateDealActDate.pending,
            (state: IDealActDateState) => {
                state.isUpdating = true;
                state.error = null;
            },
        );
        builder.addCase(
            updateDealActDate.rejected,
            (
                state: IDealActDateState,
                action: PayloadAction<string | undefined>,
            ) => {
                state.error = action.payload || (null as string | null);
                state.isUpdating = false;
            },
        );
    },
});

export const { setDealActDate } = dealActDateSlice.actions;
export const dealActDateReducer = dealActDateSlice.reducer;
