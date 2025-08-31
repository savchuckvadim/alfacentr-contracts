import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { documentNumberDone } from '../thunk/DocumentNumberThunk';
import { IDocumentNumberUpdateDoneResult } from '../../type/document-number.type';

export interface IDocumentNumberState {
    prefix: string;
    counter: number;
    isLoading: boolean;
    error: string | null;
    fetched: boolean;
}

const initialState: IDocumentNumberState = {
    prefix: '',
    counter: 0,
    isLoading: false,
    error: null,
    fetched: false,
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
            state.fetched = true;

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
            state.fetched = true;
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
                state.fetched = true;
            },
        );
        builder.addCase(
            documentNumberDone.rejected,
            (state: IDocumentNumberState, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.fetched = true;
            },
        );
    },
});

export const documentNumberSliceActions = documentNumberSlice.actions;

export const documentNumberReducer = documentNumberSlice.reducer;
