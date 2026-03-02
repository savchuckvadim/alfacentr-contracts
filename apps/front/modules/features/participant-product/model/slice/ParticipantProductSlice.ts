import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IParticipantPpk } from '../../type/participant-ppk.type';

export interface IParticipantProductState {
    ppkDistribution: IParticipantPpk;
    seminarDistribution: IParticipantPpk;
}
const initialState: IParticipantProductState = {
    ppkDistribution: {
        participantsPpkTopicsStats: {},
        participantToProducts: {},
        productToParticipants: {},
        topicStats: [],
        unassignedParticipants: [],
    },
    seminarDistribution: {
        participantsPpkTopicsStats: {},
        participantToProducts: {},
        productToParticipants: {},
        topicStats: [],
        unassignedParticipants: [],
    },
};

export const participantProductSlice = createSlice({
    name: 'participantProduct',
    initialState,
    reducers: {
        setParticipantPpk: (
            state: IParticipantProductState,
            action: PayloadAction<IParticipantPpk>,
        ) => {
            state.ppkDistribution = action.payload;
        },
        setParticipantSeminar: (
            state: IParticipantProductState,
            action: PayloadAction<IParticipantPpk>,
        ) => {
            state.seminarDistribution = action.payload;
        },
    },
});
export const { setParticipantPpk, setParticipantSeminar } =
    participantProductSlice.actions;
export const participantProductReducer = participantProductSlice.reducer;
