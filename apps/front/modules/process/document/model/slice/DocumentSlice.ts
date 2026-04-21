import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { documentGenerate } from '../thunk/DocumentThunk';

export interface IDocumentState {
    document: {
        isGenerating: boolean;
        isGenerated: boolean;
        isGeneratedError: boolean;
        isGeneratedSuccess: boolean;
    };
    // emailConfirm: {
    //     isActive: boolean;
    //     isConfirmed: boolean;
    //     needEmail: boolean;
    //     emailError: string;
    //     phoneError: string;
    // };
    // validateLoading: boolean;
}
const initialState = {
    document: {
        isGenerating: false,
        isGenerated: false,
        isGeneratedError: false,
        isGeneratedSuccess: false,
    },
    // emailConfirm: {
    //     isActive: false,
    //     isConfirmed: false,
    //     needEmail: false,
    //     emailError: '',
    //     phoneError: '',
    // },
    // validateLoading: false,
};

export const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers: {
        setDocumentGenerating: (
            state: IDocumentState,
            action: PayloadAction<boolean>,
        ) => {
            state.document.isGenerating = action.payload;
        },
        setDocumentGenerated: (
            state: IDocumentState,
            action: PayloadAction<boolean>,
        ) => {
            state.document.isGenerated = action.payload;
        },
        setDocumentGeneratedError: (
            state: IDocumentState,
            action: PayloadAction<boolean>,
        ) => {
            state.document.isGeneratedError = action.payload;
        },
        setDocumentGeneratedSuccess: (
            state: IDocumentState,
            action: PayloadAction<boolean>,
        ) => {
            state.document.isGeneratedSuccess = action.payload;
        },
    },
    extraReducers: builder => {
        builder.addCase(
            documentGenerate.fulfilled,
            (state: IDocumentState, action: PayloadAction<boolean>) => {
                state.document.isGenerating = false;
                state.document.isGenerated = true;
                state.document.isGeneratedSuccess = true;
            },
        );
        builder.addCase(
            documentGenerate.rejected,
            (state: IDocumentState, action) => {
                state.document.isGenerating = false;
                state.document.isGenerated = false;
                state.document.isGeneratedError = true;
            },
        );
        builder.addCase(
            documentGenerate.pending,
            (state: IDocumentState, action) => {
                state.document.isGenerating = true;
                state.document.isGenerated = false;
                state.document.isGeneratedError = false;
                state.document.isGeneratedSuccess = false;
            },
        );
    },
});

export const documentSliceActions = documentSlice.actions;
export const documentReducer = documentSlice.reducer;
