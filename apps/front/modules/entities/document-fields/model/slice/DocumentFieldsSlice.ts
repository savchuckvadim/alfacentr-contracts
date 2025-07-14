import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { EContractType } from "@/modules/features"

export enum EDocumentFieldCode {
    contractType = 'contractType',
    contractName = 'contractName',
    contractDate = 'contractDate',
    contractNumber = 'contractNumber',
    contractPrefix = 'contractPrefix',
    header = 'header',
    products = 'products',
    participants = 'participants',
    paragraf12 = 'paragraf12',

}
export interface IDocumentField {
    id: string
    name: string
    code: EDocumentFieldCode
    templateCode: string
    isMultiple: boolean
    type: 'string' | 'date' | 'datetime' | 'number'
    for: EContractType[]
    value: string
}

// полностью подготовленные поля для документа со спциальными пропусками и тд

export interface IDocumentFieldsState {
    fields: IDocumentField[]
    editable: IDocumentField | null
    loading: boolean
    error: null | string
}


export const initialState: IDocumentFieldsState = {
    fields: [],
    editable: null,
    loading: false,
    error: null
}

const documentFieldsSlice = createSlice({
    name: 'documentFields',
    initialState,
    reducers: {
        setDocumentFields: (state, action: PayloadAction<{
            code: EDocumentFieldCode,
            value: string
        }>) => {
            const field = state.fields.find(field => field.code === action.payload.code)
            if (field) {
                field.value = action.payload.value
            }
        }
    }
})
export const { setDocumentFields } = documentFieldsSlice.actions
export const documentFieldsReducer = documentFieldsSlice.reducer
