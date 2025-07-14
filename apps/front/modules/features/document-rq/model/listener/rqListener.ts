import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit"
import { DocumentRqState, setClient } from "../slice/DocumentRqSlice"
import { RQ_TYPE, setCurrentItem } from "@workspace/bx-rq"
import { ContractRqService } from "../../utils/service/rq.service"
import { RootState } from "@/modules/app/model/store";
import { setDealData } from "@/modules/entities/deal/model/DealSlice";
import { getDealClientType } from "@/modules/entities/deal/lib/utils/get-deal-client-type.util";


export const rqListener = createListenerMiddleware()

rqListener.startListening({
    matcher: isAnyOf(
        setCurrentItem,
        setDealData


    ),
    effect: async (action, listenerApi) => {

        const { getState } = listenerApi;
        const state = getState() as  RootState;

        const currentItem = state.bxrq.rqs?.current;
      
        const dealData = state.deal.dealData;
        let currentClientType = RQ_TYPE.ORGANIZATION;
        if (dealData) {
            currentClientType = getDealClientType(dealData);
        }


        if (currentItem) {
            const service = new ContractRqService()
            const clientRqs = service.getRqs(currentItem, currentClientType)
            console.log('clientRqs', clientRqs)
            listenerApi.dispatch(setClient(clientRqs.client))
        }
    }

})