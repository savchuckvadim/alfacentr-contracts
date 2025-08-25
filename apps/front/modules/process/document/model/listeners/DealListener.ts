import { AppDispatch, RootState } from '@/modules/app/model/store';
import { updateDealField } from '@/modules/entities/deal/model/DealThunk';
import { setDealData } from '@/modules/entities/deal/model/DealSlice';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';

export function setupDocumentDealListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(setDealData, updateDealField.fulfilled),
        effect: async (action, listenerApi) => {
            const dispatch = listenerApi.dispatch as AppDispatch;
            console.log('Process DealListener', action);

        },
    });
}
