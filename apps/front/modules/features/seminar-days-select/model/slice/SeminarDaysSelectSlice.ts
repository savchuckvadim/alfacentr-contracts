import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ISeminarDay {
    id: number;
    name: string;
}
export interface ISeminarDaysSelectState {
    days: ISeminarDay[];
}
const initialState: ISeminarDaysSelectState = {
    days: [],
};

export const seminarDaysSelectSlice = createSlice({
    name: 'seminarDaysSelect',
    initialState,
    reducers: {
        setSeminarDays: (
            state: ISeminarDaysSelectState,
            action: PayloadAction<string[]>,
        ) => {
            state.days = action.payload.map((day, index) => ({
                id: index,
                name: day,
            }));
        },
    },
});
export const { setSeminarDays } = seminarDaysSelectSlice.actions;
export const seminarDaysSelectReducer = seminarDaysSelectSlice.reducer;
