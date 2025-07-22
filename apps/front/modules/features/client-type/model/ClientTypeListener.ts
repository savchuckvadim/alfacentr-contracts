import { RootState } from '@/modules/app/model/store';
import { updateFieldValue } from '@/modules/entities/deal/model/DealSlice';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { setCurrentRqItems, setFetched } from '@workspace/bx-rq';
import { getDealClientType } from '@/modules/entities/deal/lib/utils/get-deal-client-type.util';

// export const clientTypeListener = createListenerMiddleware();
export function setupClientTypeListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(
            // setDealData,
            updateFieldValue,
            setFetched,
        ),
        effect: async (action, listenerApi) => {
            const { dispatch, getState } = listenerApi;
            const state = getState() as RootState;
            const dealData = state.deal.dealData;
            const bxRqState = state.bxrq;

            if (
                dealData &&
                bxRqState.rqs &&
                bxRqState.isFetched &&
                !bxRqState.isLoading
            ) {
                const currentClientType = getDealClientType(dealData);

                dispatch(setCurrentRqItems({ clientType: currentClientType }));
            }
        },
    });
}
