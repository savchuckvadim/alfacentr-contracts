import { AppDispatch, RootState } from '@/modules/app/model/store';
import { updateFieldValue } from '@/modules/entities/deal/model/DealSlice';
import { updateDealField } from '@/modules/entities/deal/model/DealThunk';
import { BxDealDataKeys } from '@alfa/entities';
import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { communicationsActions } from '../slice/CommunicationsSlice';
import { saveCurrentContact } from '../thunk/SaveCurrentContactThunk';

// name и phone при изменении обновляются только как поля сделки,
// без подтверждения; контакт пересохраняется только при смене email
const DEAL_ONLY_FIELD_KEYS: BxDealDataKeys[] = [
    BxDealDataKeys.exchange_doc_phone,
    BxDealDataKeys.exchange_doc_name,
];

const CONTACT_FIELD_KEYS: BxDealDataKeys[] = [
    BxDealDataKeys.exchange_doc_email,
    ...DEAL_ONLY_FIELD_KEYS,
];

const getContactFieldValue = (state: RootState, code: BxDealDataKeys) => {
    const field = state.deal.dealData?.find(item => item.code === code);
    return field?.value ? String(field.value) : '';
};

const isAllContactFieldsFilled = (state: RootState) => {
    return CONTACT_FIELD_KEYS.every(code =>
        getContactFieldValue(state, code),
    );
};

export function setupCommunicationsDealListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        actionCreator: updateFieldValue,
        effect: async (action, listenerApi) => {
            const { fieldKey, value } = action.payload;
            if (!CONTACT_FIELD_KEYS.includes(fieldKey)) {
                return;
            }

            const oldValue = getContactFieldValue(
                listenerApi.getOriginalState() as RootState,
                fieldKey,
            );
            if (oldValue === String(value)) {
                return;
            }

            const state = listenerApi.getState() as RootState;
            const dispatch = listenerApi.dispatch as AppDispatch;

            if (DEAL_ONLY_FIELD_KEYS.includes(fieldKey)) {
                const field = state.deal.dealData?.find(
                    item => item.code === fieldKey,
                );
                if (!field) {
                    return;
                }
                dispatch(updateDealField({ fieldKey, value, field }));
                return;
            }

            // email: saveCurrentContact отклоняется без полного набора полей
            if (!isAllContactFieldsFilled(state)) {
                return;
            }

            const { isChangeContactNeedConfirm } =
                state.communications.contactSync;

            if (isChangeContactNeedConfirm) {
                dispatch(
                    communicationsActions.setContactSyncConfirmActive(true),
                );
            } else {
                dispatch(saveCurrentContact());
            }
        },
    });
}
