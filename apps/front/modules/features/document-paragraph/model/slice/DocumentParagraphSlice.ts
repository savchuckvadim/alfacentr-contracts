import { RootState } from '@/modules/app/model/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// TODO example for several paragraphs https://alfacentr.bitrix24.ru/crm/type/159/details/8578/
export interface DocumentParagraphState {
    paragraph: string;
    totalSum: string;
    paragraphItems: string[];
}
export const initialState: DocumentParagraphState = {
    paragraph: '',
    totalSum: '',
    paragraphItems: [],
};

export const documentParagraphSlice = createSlice({
    name: 'DocumentParagraph',
    initialState,
    reducers: {
        setParagraph: (
            state: DocumentParagraphState,
            action: PayloadAction<{
                paragraph: string;
                paragraphItems: string[];
            }>,
        ) => {
            state.paragraph = action.payload.paragraph;
            state.paragraphItems = action.payload.paragraphItems;
        },
        setTotalSum: (
            state: DocumentParagraphState,
            action: PayloadAction<string>,
        ) => {
            state.totalSum = action.payload;
        },
    },
});

export const { setParagraph, setTotalSum } = documentParagraphSlice.actions;
export const documentParagraphReducer = documentParagraphSlice.reducer;

export const selectDocumentParagraph = (state: RootState) =>
    state.documentParagraph.paragraph;
export const selectDocumentTotalSum = (state: RootState) =>
    state.documentParagraph.totalSum;
export const selectDocumentParagraphItems = (state: RootState) =>
    state.documentParagraph.paragraphItems;
