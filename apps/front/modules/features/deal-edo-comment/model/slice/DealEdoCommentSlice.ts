import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateDealEdoCommentThunk } from '../thunk/update-deal-edo-comment.thunk';

export interface IDealEdoCommentState {
    value: string | null;
    error: string | null;
    isUpdating: boolean;
}

const initialState: IDealEdoCommentState = {
    value: null,
    error: null,
    isUpdating: false,
};

const dealEdoCommentSlice = createSlice({
    name: 'dealEdoComment',
    initialState,
    reducers: {
        setDealEdoComment: (
            state: IDealEdoCommentState,
            action: PayloadAction<string>,
        ) => {
            state.value = action.payload;
        },
    },
    extraReducers: builder => {
        builder.addCase(
            updateDealEdoCommentThunk.fulfilled,
            (state: IDealEdoCommentState, action: PayloadAction<string>) => {
                state.value = action.payload as string;
                state.error = null;
                state.isUpdating = false;
            },
        );
        builder.addCase(
            updateDealEdoCommentThunk.pending,
            (state: IDealEdoCommentState) => {
                state.isUpdating = true;
                state.error = null;
            },
        );
        builder.addCase(
            updateDealEdoCommentThunk.rejected,
            (
                state: IDealEdoCommentState,
                action: PayloadAction<string | undefined>,
            ) => {
                state.error = action.payload || (null as string | null);
                state.isUpdating = false;
            },
        );
    },
});

export const { setDealEdoComment } = dealEdoCommentSlice.actions;
export const dealEdoCommentReducer = dealEdoCommentSlice.reducer;
