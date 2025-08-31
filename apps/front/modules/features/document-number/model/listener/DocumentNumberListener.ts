import { appActions } from '@/modules/app/model/AppSlice';
import { wsInit } from '@/modules/app/model/queue-ws-ping-test/QueueWsPingListener';
import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { fetchProducts, setFetchedProducts } from '@/modules/entities';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { registerWSHandler } from '@/modules/shared/Websocket';
import {
    documentNumberDone,
    updateDocumentNumber,
} from '../thunk/DocumentNumberThunk';
import { IDocumentNumberUpdateDoneResponse } from '../../type/document-number.type';

export function setupDocumentNumberListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(setFetchedProducts, fetchProducts.fulfilled),
        effect: async (action, listenerApi) => {
            const state = listenerApi.getState() as RootState;
            const app = state.app;
            const products = state.product.items;
         

            if (app.bitrix.deal && products?.length > 0) {
                const dispatch = listenerApi.dispatch as AppDispatch;
                dispatch(updateDocumentNumber());
            }
        },
    });

    listenerMiddleware.startListening({
        matcher: isAnyOf(wsInit.fulfilled),

        effect: async (action, listenerApi) => {
            console.log('🔧 Setting up document-number:done handler');
            registerWSHandler('document-number:done', (data, dispatch) => {
                console.log(
                    '🔧 document-number:done handler called with data:',
                    data,
                );
                dispatch(
                    documentNumberDone(
                        data as IDocumentNumberUpdateDoneResponse,
                    ),
                );
            });
        },
    });
}
