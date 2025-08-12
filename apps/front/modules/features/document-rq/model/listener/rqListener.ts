import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { setClient } from '../slice/DocumentRqSlice';
import {
    RQ_TYPE,
    saveAddressCreating,
    saveBankCreating,
    saveBaseCreating,
    setCurrentItem,
    setCurrentRqItems,
    setFetched,
} from '@workspace/bx-rq';
import { ContractRqService } from '../../utils/service/rq.service';
import { RootState } from '@/modules/app/model/store';
import { setDealData } from '@/modules/entities/deal/model/DealSlice';
import { getDealClientType } from '@/modules/entities/deal/lib/utils/get-deal-client-type.util';
import { ContractRqHeaderService } from '../../utils/service/header.service';

// export const rqListener = createListenerMiddleware()
export function setupRqListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(
            setFetched,
            setCurrentItem,
            setCurrentRqItems,
            setDealData,
            saveBaseCreating,
            saveAddressCreating,
            saveBankCreating,
        ),

        effect: async (action, listenerApi) => {
            const { getState } = listenerApi;

            const state = getState() as RootState;
            const currentItem = state.bxrq?.current?.item;

            const dealData = state.deal.dealData;
            let currentClientType = RQ_TYPE.ORGANIZATION;
            if (dealData) {
                currentClientType = getDealClientType(dealData);
            }

            if (currentItem) {
                const service = new ContractRqService();
                const clientRqs = service.getRqs(
                    currentItem,
                    currentClientType,
                );
                const headerService = new ContractRqHeaderService(service);
                const header = headerService.getContractHeaderText(
                    currentClientType,
                    currentItem,
                );

                listenerApi.dispatch(
                    setClient({
                        client: clientRqs.client,
                        header: header,
                        clientShortRq: clientRqs.clientShortRq,
                    }),
                );
            }
        },
    });
}
