// * Сколько участников с ппк сколько без
// * Соответствует количество товаров количеству участников
//
// ppkProductQuantity - количство товаров ППК
// seminarProductQuantity - количство товаров Семинар
// participantPpkQuantity - колиество всех ппк программ в участниках
// participantSeminarQuantity - колиество всех участников

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IParticipantPpk } from "../../type/participant-ppk.type";

//participantInSeminar
//participantInPpkProduct
//participantWithoutPpkProduct - which theme?
//ppkProductWithoutParticipant

// карточка участника и ссылки на товары у каждой темы ppk
// карточка товара и все участники в ней
// предупреждения о несоответствиях
// список всех товаров-ппк для выбора внутри участника
// список всех участников для выбора в товаре участника который пойдет
// соответствие количества товара количеству участников в нем

// export interface ParticipantProductState {
//     [EParticipantProduct.participantInSeminar]: number,
//     [EParticipantProduct.participantInPpkProduct]: number,
//     [EParticipantProduct.participantWithoutPpkProduct]: number,
//     [EParticipantProduct.ppkProductWithoutParticipant]: number
// }

// export enum EParticipantProduct {
//     participantInSeminar = 'participantInSeminar',
//     participantInPpkProduct = 'participantInPpkProduct',
//     participantWithoutPpkProduct = 'participantWithoutPpkProduct',
//     ppkProductWithoutParticipant = 'ppkProductWithoutParticipant'
// }
export interface IParticipantProductState {
    ppkDistribution: IParticipantPpk
}
const initialState: IParticipantProductState = {
    ppkDistribution: {
        participantsPpkTopicsStats: {},
        participantToProducts: {},
        productToParticipants: {},
        topicStats: [],
        unassignedParticipants: []
    }
}

export const participantProductSlice = createSlice({
    name: 'participantProduct',
    initialState,
    reducers: {
        setParticipantPpk: (state: IParticipantProductState, action: PayloadAction<IParticipantPpk>) => {
            console.log('setParticipantPpk', action.payload)
            console.log('topicStats', action.payload.topicStats)
            state.ppkDistribution = action.payload
        }
    }
})
export const { setParticipantPpk } = participantProductSlice.actions
export const participantProductReducer = participantProductSlice.reducer





