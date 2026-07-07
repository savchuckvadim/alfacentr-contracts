import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { validateEmailAndPhone } from '../thunk/CommunicationsThunk';
import { saveCurrentContact } from '../thunk/SaveCurrentContactThunk';

export interface ICommunicationsState {
    confirm: {
        isActive: boolean;
        isConfirmed: boolean;
        needEmail: boolean;
    };
    contactSync: {
        isChangeContactNeedConfirm: boolean;
        isConfirmActive: boolean;
        isSaving: boolean;
    };
    errors: {
        email: string;
        phone: string;
        name: string;
    };
    validateLoading: boolean;
}
const initialState: ICommunicationsState = {
    confirm: {
        isActive: false,
        isConfirmed: false,
        needEmail: true,
    },
    contactSync: {
        isChangeContactNeedConfirm: true,
        isConfirmActive: false,
        isSaving: false,
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
        setChangeContactNeedConfirm: (
            state: ICommunicationsState,
            action: PayloadAction<boolean>,
        ) => {
            state.contactSync.isChangeContactNeedConfirm = action.payload;
        },
        setContactSyncConfirmActive: (
            state: ICommunicationsState,
            action: PayloadAction<boolean>,
        ) => {
            state.contactSync.isConfirmActive = action.payload;
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
        //save current contact in deal
        builder.addCase(
            saveCurrentContact.pending,
            (state: ICommunicationsState) => {
                state.contactSync.isSaving = true;
            },
        );
        builder.addCase(
            saveCurrentContact.fulfilled,
            (state: ICommunicationsState) => {
                state.contactSync.isSaving = false;
                state.contactSync.isConfirmActive = false;
            },
        );
        builder.addCase(
            saveCurrentContact.rejected,
            (state: ICommunicationsState) => {
                state.contactSync.isSaving = false;
                state.contactSync.isConfirmActive = false;
            },
        );
    },
});

export const communicationsActions = communicationsSlice.actions;
export const communicationsReducer = communicationsSlice.reducer;
