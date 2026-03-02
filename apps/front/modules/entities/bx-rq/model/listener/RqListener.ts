import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';

import {
    RQ_TYPE,
    saveAddressCreating,
    saveBankCreating,
    saveBaseCreating,
    setCurrentItem,
    setCurrentRqItems,
    setFetched,
} from '@workspace/bx-rq';
import { RootState } from '@/modules/app/model/store';
import { setDealData } from '@/modules/entities/deal/model/DealSlice';
import { getDealClientType } from '@/modules/entities/deal/lib/utils/get-deal-client-type.util';
import { setCurrentRqThunk } from '../thunk/CurrentRqThunk';

// export const rqListener = createListenerMiddleware()
export function setupCurrentRqListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(
            // setFetched,
            setCurrentItem,
            setCurrentRqItems,
            saveBaseCreating,
            // setDealData,
            // saveBaseCreating,
            // saveAddressCreating,
            // saveBankCreating,
        ),

        effect: async (action, listenerApi) => {
            const { getState } = listenerApi;

            // const state = getState() as RootState;
            // const currentItem = state.bxrq?.current?.item;

            // const dealData = state.deal.dealData;
            // let currentClientType = RQ_TYPE.ORGANIZATION;
            // if (dealData) {
            //     currentClientType = getDealClientType(dealData) || RQ_TYPE.ORGANIZATION;
            // }

            listenerApi.dispatch(setCurrentRqThunk());
        },
    });
}
