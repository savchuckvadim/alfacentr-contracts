import { RootState } from '@/modules/app/model/store';
import { updateFieldValue } from '@/modules/entities/deal/model/DealSlice';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { setCurrentRqItems, setFetched } from '@workspace/bx-rq';
import { getDealClientType } from '@/modules/entities/deal/lib/utils/get-deal-client-type.util';
import { getCurrentRq } from '@/modules/entities';
import { IBXDeal } from '@bitrix/index';

// export const clientTypeListener = createListenerMiddleware();
export function setupClientTypeListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(
            // setDealData,
            updateFieldValue,  //если просходит обноаления в полях сделки - bid конкретно интересует тип клиента
            setFetched,  // после того как происходит загрузка реквизитов

            //
        ),
        effect: async (action, listenerApi) => {
            const { dispatch, getState } = listenerApi;
            const state = getState() as RootState;
            const dealData = state.deal.dealData;
            const bxRqState = state.bxrq;
            const deal = state.app.bitrix.deal;
            if (
                dealData &&
                bxRqState.rqs &&
                bxRqState.isFetched &&
                !bxRqState.isLoading
            ) {
                const currentRqId = getCurrentRq(deal as IBXDeal) || (undefined as undefined);

                const clientType = getDealClientType(dealData);
                debugger;
                dispatch(setCurrentRqItems({ clientType, currentRqId }));
                //TODO передать текущий rq_id
            }
        },
    });
}
