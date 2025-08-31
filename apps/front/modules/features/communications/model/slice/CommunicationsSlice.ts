import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { validateEmailAndPhone } from '../thunk/CommunicationsThunk';

export interface ICommunicationsState {

    confirm: {
        isActive: boolean;
        isConfirmed: boolean;
        needEmail: boolean;
    },
    errors: {
        email: string;
        phone: string;
        name: string;
    },
    validateLoading: boolean;
}
const initialState: ICommunicationsState = {
    confirm: {
        isActive: false,
        isConfirmed: false,
        needEmail: true,
    },
    errors: {
        email: '',
        phone: '',
        name: '',
    },
    validateLoading: false,
};

export const communicationsSlice = createSlice({
    name: 'communications',
    initialState,
    reducers: {

        setConfirmCommunicationsActive: (
            state: ICommunicationsState,
            action: PayloadAction<boolean>,
        ) => {
            state.confirm.isActive = action.payload;
        },
        setEmailConfirmConfirmed: (
            state: ICommunicationsState,
            action: PayloadAction<boolean>,
        ) => {
            state.confirm.isConfirmed = action.payload;
        },
        setPhoneError: (
            state: ICommunicationsState,
            action: PayloadAction<string>,
        ) => {
            state.errors.phone = action.payload;
        },
        setEmailError: (
            state: ICommunicationsState,
            action: PayloadAction<string>,
        ) => {
            state.errors.email = action.payload;
        },
        setNameError: (
            state: ICommunicationsState,
            action: PayloadAction<string>,
        ) => {
            state.errors.name = action.payload;
        },
        setNeedEmail: (
            state: ICommunicationsState,
            action: PayloadAction<boolean>,
        ) => {
            state.confirm.needEmail = action.payload;
        },
    },
    extraReducers: builder => {


        //check email and phone
        builder.addCase(
            validateEmailAndPhone.fulfilled,
            (
                state: ICommunicationsState,
                action: PayloadAction<{ email: string; phone: string }>,
            ) => {
                state.errors.email = action.payload.email;
                state.errors.phone = action.payload.phone;
                state.validateLoading = false;
            },
        );
        builder.addCase(
            validateEmailAndPhone.pending,
            (state: ICommunicationsState, action) => {
                state.validateLoading = true;
            },
        );
    },
});

export const communicationsActions = communicationsSlice.actions;
export const communicationsReducer = communicationsSlice.reducer;
