import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    documentNumberDone,
    updateDocumentNumber,
} from '../thunk/DocumentNumberThunk';
import { IDocumentNumberUpdateDoneResult } from '../../type/document-number.type';

export interface IDocumentNumberState {
    prefix: string;
    counter: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: IDocumentNumberState = {
    prefix: '',
    counter: 0,
    isLoading: false,
    error: null,
};

export const documentNumberSlice = createSlice({
    name: 'documentNumber',
    initialState,
    reducers: {
        setDocumentNumber: (
            state: IDocumentNumberState,
            action: PayloadAction<IDocumentNumberUpdateDoneResult>,
        ) => {
            state.prefix = action.payload.prefix;
            state.counter = action.payload.counter;
        },
        setLoading: (
            state: IDocumentNumberState,
            action: PayloadAction<boolean>,
        ) => {
            state.isLoading = action.payload;
        },
        setError: (
            state: IDocumentNumberState,
            action: PayloadAction<string | null>,
        ) => {
            state.error = action.payload;
        },
    },
    extraReducers: builder => {
        builder.addCase(
            documentNumberDone.pending,
            (state: IDocumentNumberState) => {
                state.isLoading = true;
            },
        );
        builder.addCase(
            documentNumberDone.fulfilled,
            (
                state: IDocumentNumberState,
                action: PayloadAction<IDocumentNumberUpdateDoneResult>,
            ) => {
                state.isLoading = false;
                state.prefix = action.payload.prefix;
                state.counter = action.payload.counter;
            },
        );
        builder.addCase(
            documentNumberDone.rejected,
            (state: IDocumentNumberState, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            },
        );
    },
});

export const documentNumberSliceActions = documentNumberSlice.actions;

export const documentNumberReducer = documentNumberSlice.reducer;
