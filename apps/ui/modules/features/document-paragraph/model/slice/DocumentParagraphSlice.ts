import { RootState } from "@/modules/app/model/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DocumentParagraphState {
    paragraph: string
    totalSum: string
}
export const initialState: DocumentParagraphState = {
    paragraph: '',
    totalSum: ''
}

export const documentParagraphSlice = createSlice({
    name: 'DocumentParagraph',
    initialState,
    reducers: {
        setParagraph: (state: DocumentParagraphState, action: PayloadAction<string>) => {
            state.paragraph = action.payload
        },
        setTotalSum: (state: DocumentParagraphState, action: PayloadAction<string>) => {
            state.totalSum = action.payload
        }
    },
})

export const { setParagraph, setTotalSum } = documentParagraphSlice.actions
export const documentParagraphReducer = documentParagraphSlice.reducer

export const selectDocumentParagraph = (state: RootState) => state.documentParagraph.paragraph
export const selectDocumentTotalSum = (state: RootState) => state.documentParagraph.totalSum