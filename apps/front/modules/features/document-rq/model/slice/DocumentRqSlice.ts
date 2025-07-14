import { RQ_TYPE } from "@workspace/bx-rq"
import { Provider } from "../../consts/provider-rq.const"
import { createSlice } from "@reduxjs/toolkit"
import { PayloadAction } from "@reduxjs/toolkit"

export interface DocumentRqGeneral {
    id: number
    header: string
    value: string
}

export interface DocumentRqAgent {
    id: number
    name: string
    fullname?: string
    shortName?: string
    fio?: string
    director?: string
    directorCase?: string
    gb?: string
    based: string

    inn: string
    kpp: string
    other?: string
    address: string
    bank: string
    bik?: string
    rs?: string
    ks?: string
    providerCompanyDirectorPosition?: string
    providerCompanyDirectorName?: string
    phone: string
    email: string
    type: RQ_TYPE
    documentType?: string
    docSeries?: string
    docNumber?: string
    docDate?: string
    depCode?: string

}

export interface DocumentRqState {
    general: DocumentRqGeneral
    client: DocumentRqAgent | null
    provider: DocumentRqAgent | null
}

const initialState: DocumentRqState = {
    general: {
        id: 0,
        header: '',
        value: ''
    },
    client: null,
    provider: Provider,

}

export const documentRqSlice = createSlice({
    name: 'documentRq',
    initialState,
    reducers: {
        setClient: (state: DocumentRqState, action: PayloadAction<DocumentRqAgent>) => {
            state.client = action.payload
        },
        setProvider: (state: DocumentRqState, action: PayloadAction<DocumentRqAgent>) => {
            state.provider = action.payload
        }
    }
})

export const { setClient, setProvider } = documentRqSlice.actions
export const documentRqReducer = documentRqSlice.reducer

