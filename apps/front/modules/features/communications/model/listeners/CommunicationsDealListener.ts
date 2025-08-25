import { AppDispatch, RootState } from '@/modules/app/model/store';
import { updateDealField } from '@/modules/entities/deal/model/DealThunk';
import { setDealData } from '@/modules/entities/deal/model/DealSlice';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { validateEmailAndPhone } from '../thunk/CommunicationsThunk';
import { BxDealDataKeys } from '@alfa/entities';

export function setupCommunicationsDealListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(setDealData, updateDealField.fulfilled),
        effect: async (action, listenerApi) => {
            const dispatch = listenerApi.dispatch as AppDispatch;

            if (updateDealField.fulfilled.match(action)) {
                // вот здесь у тебя результат санки
                const payload = action.payload;
                if (
                    payload.fieldKey === BxDealDataKeys.exchange_doc_email ||
                    payload.fieldKey === BxDealDataKeys.exchange_doc_phone
                ) {

                    dispatch(validateEmailAndPhone());
                }
            }

            if (setDealData.match(action)) {

                dispatch(validateEmailAndPhone());
            }
        },
    });
}
