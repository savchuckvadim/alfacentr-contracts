import { AppDispatch, RootState } from '@/modules/app/model/store';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { appActions } from '@/modules/app/model/AppSlice';
import { initOwnBank } from '../thunk/DealOwnBankThunk';


export function setupOwnBankDealListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(appActions.setAppData),
        effect: async (action, listenerApi) => {
            const dispatch = listenerApi.dispatch as AppDispatch;
            const state = listenerApi.getState() as RootState;
            const deal = state.app.bitrix.deal;
            dispatch(initOwnBank({ deal }));

        },
    });
}
