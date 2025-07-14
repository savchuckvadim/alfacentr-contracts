import {  RootState } from "@/modules/app/model/store";
import { setDealData, updateFieldValue } from "@/modules/entities/deal/model/DealSlice";
import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import {  setCurrentRqItems, setFetched } from "@workspace/bx-rq";
import { getDealClientType } from "@/modules/entities/deal/lib/utils/get-deal-client-type.util";

export const clientTypeListener = createListenerMiddleware();
clientTypeListener.startListening({
    matcher: isAnyOf(setDealData, updateFieldValue, setFetched),
    effect: async (action, listenerApi) => {
        const { dispatch, getState } = listenerApi;
        const state = getState() as RootState;
        const dealData = state.deal.dealData;
        const bxRqState = state.bxrq;
        debugger
        if (dealData && bxRqState.rqs && bxRqState.isFetched && !bxRqState.isLoading) {
            const currentClientType = getDealClientType(dealData);
            debugger  
            dispatch(setCurrentRqItems({ clientType: currentClientType }));

        }
    },
});


