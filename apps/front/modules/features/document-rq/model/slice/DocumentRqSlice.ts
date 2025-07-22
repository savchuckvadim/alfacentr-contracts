import { RQ_TYPE } from '@workspace/bx-rq';
import { Provider } from '../../consts/provider-rq.const';
import { createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    EnumFizRqFields,
    EnumOrganizationRqFields,
} from '../../type/document-rq.type';

export interface DocumentRqGeneral {
    id: number;
    header: string;
}

export type DocumentRqAgent<T extends RQ_TYPE> = T extends RQ_TYPE.FIZ
    ? DocumentFizRqAgent
    : DocumentOrganizationRqAgent;

export type DocumentOrganizationRqAgent = {
    [key in EnumOrganizationRqFields]: string;
};
export type DocumentFizRqAgent = {
    [key in EnumFizRqFields]: string;
};

export interface DocumentRqState {
    general: DocumentRqGeneral;
    client: DocumentOrganizationRqAgent | DocumentFizRqAgent | null;
    provider: DocumentOrganizationRqAgent | DocumentFizRqAgent | null;
    clientShortRq: string;
}

const initialState: DocumentRqState = {
    general: {
        id: 0,
        header: '',
    },
    client: null,
    provider: Provider,
    clientShortRq: '',
};

export const documentRqSlice = createSlice({
    name: 'documentRq',
    initialState,
    reducers: {
        setClient: <T extends RQ_TYPE>(
            state: DocumentRqState,
            action: PayloadAction<{
                client: DocumentRqAgent<T>;
                header: string;
                clientShortRq: string;
            }>,
        ) => {
            state.client = action.payload.client;
            state.general.header = action.payload.header;
            debugger;
            state.clientShortRq = action.payload.clientShortRq;
        },
        setProvider: (
            state: DocumentRqState,
            action: PayloadAction<DocumentRqAgent<RQ_TYPE.ORGANIZATION>>,
        ) => {
            state.provider = action.payload;
        },
    },
});

export const { setClient, setProvider } = documentRqSlice.actions;
export const documentRqReducer = documentRqSlice.reducer;
