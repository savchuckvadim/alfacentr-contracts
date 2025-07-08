import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IAlfaProduct } from "@/modules/entities/product";
import { getContractTypeByProducts } from "../lib/utils/get-contract-type-by-products.util";

export interface IContractTypeState {

    items: EContractTypeField[],
    current: null | EContractTypeField,
    loading: boolean,
    error: string | null
}
export enum EContractType {
    seminar = 'seminar',
    ppk = 'ppk',
    seminar_ppk = 'seminar_ppk',
    up = 'up'
}
export enum EContractName {
    seminar = 'Семинар',
    ppk = 'ППК',
    seminar_ppk = 'Семинар ППК',
    up = 'УП'
}

export interface EContractTypeField {
    code: EContractType,
    name: EContractName,
    id: number,

}

const initialState: IContractTypeState = {

    items: [
        {
            code: EContractType.seminar,
            name: EContractName.seminar,
            id: 1,
        },
        {
            code: EContractType.ppk,
            name: EContractName.ppk,
            id: 2,
        },
        {
            code: EContractType.seminar_ppk,
            name: EContractName.seminar_ppk,
            id: 3,
        },
        {
            code: EContractType.up,
            name: EContractName.up,
            id: 4,
        }
    ],
    current: null as null | EContractTypeField,
    loading: false,
    error: null
}

const contractSlice = createSlice({
    name: 'contract',
    initialState,
    reducers: {
        setCurrentContractType: (state, action: PayloadAction<{ products: IAlfaProduct[] }>) => {
            const currentCode = getContractTypeByProducts(action.payload.products)
            state.current = state.items.find(item => item.code === currentCode) || null;
        },
        setContractType: (state, action: PayloadAction<EContractTypeField>) => {
            state.current = action.payload;
        },

    }
})

export const { setCurrentContractType, setContractType } = contractSlice.actions;
export const contractTypeReducer = contractSlice.reducer;