import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { validateEmail } from '../thunk/CommunicationsThunk';
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
    /** Ошибок телефона нет: его формат не проверяется */
    errors: {
        email: string;
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
        //check email
        builder.addCase(
            validateEmail.fulfilled,
            (
                state: ICommunicationsState,
                action: PayloadAction<{ email: string }>,
            ) => {
                state.errors.email = action.payload.email;
                state.validateLoading = false;
            },
        );
        builder.addCase(
            validateEmail.pending,
            (state: ICommunicationsState) => {
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
