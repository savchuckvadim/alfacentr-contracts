import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateDealEmailSubjectThunk } from '../thunk/update-deal-emai-subject.thunk';

export interface IDealEmailSubjectState {
    value: string | null;
    error: string | null;
    isUpdating: boolean;
}

const initialState: IDealEmailSubjectState = {
    value: null,
    error: null,
    isUpdating: false,
};

const dealEmailSubjectSlice = createSlice({
    name: 'dealEmailSubject',
    initialState,
    reducers: {
        setDealEmailSubject: (
            state: IDealEmailSubjectState,
            action: PayloadAction<string>,
        ) => {
            state.value = action.payload;
        },
    },
    extraReducers: builder => {
        builder.addCase(
            updateDealEmailSubjectThunk.fulfilled,
            (state: IDealEmailSubjectState, action: PayloadAction<string>) => {
                state.value = action.payload as string;
                state.error = null;
                state.isUpdating = false;
            },
        );
        builder.addCase(
            updateDealEmailSubjectThunk.pending,
            (state: IDealEmailSubjectState) => {
                state.isUpdating = true;
                state.error = null;
            },
        );
        builder.addCase(
            updateDealEmailSubjectThunk.rejected,
            (
                state: IDealEmailSubjectState,
                action: PayloadAction<string | undefined>,
            ) => {
                state.error = action.payload || (null as string | null);
                state.isUpdating = false;
            },
        );
    },
});

export const { setDealEmailSubject } = dealEmailSubjectSlice.actions;
export const dealEmailSubjectReducer = dealEmailSubjectSlice.reducer;
