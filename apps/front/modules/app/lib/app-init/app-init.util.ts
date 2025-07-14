import { Bitrix } from "@bitrix/bitrix";
import { TESTING_DOMAIN, TESTING_USER } from "../../consts/app-global";
import { AppDispatch, AppGetState, initWSClient } from "../../model/store";
import { WSClient } from "@workspace/ws";
import { fetchProducts, setParticipants } from "@/modules/entities";
import { setDealData } from "@/modules/entities/deal/model/DealSlice";
import { getDealFieldsData } from "@/modules/entities/deal/lib/utils/get-deal-fields-data.util";
import { socketThunk } from "../../model/queue-ws-ping-test/QueueWsPingListener";
import { appActions } from "../../model/AppSlice";
import { bitrixInit } from "../bitrix-init/bitrix-init.util";


export const appInit = async (
    dispatch: AppDispatch,
    getState: AppGetState,
    getWSClient: () => WSClient,
    loadingCallBack: () => void
) => {

    const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER)
    console.log('bitrix', bitrix.api)
    console.log('bitrix initialized', bitrix.api.getInitializedData())
    const { domain, user } = bitrix.api.getInitializedData();


    console.log("user");

    console.log(user);

    const { deal, company, participants } = await bitrixInit() || {}

    if (deal && company) {
        Promise.all([
            dispatch(setParticipants(participants)),
            dispatch(fetchProducts(deal.ID.toString()) as any),
            dispatch(
                setDealData
                    (
                        getDealFieldsData(deal)
                    )
            )
            // dispatch(setFetchedProducts(rows))
        ])
    }

    initWSClient(Number(user.ID), domain); // <- здесь создаёшь сокет
    // const socket = getWSClient()
    dispatch(
        socketThunk(
            Number(user.ID),
            domain
        )
    )




    if (deal && company) {
        dispatch(
            appActions.
                setAppData(
                    {
                        domain,
                        user,
                        deal,
                        company

                    }
                ))
    }

    loadingCallBack()

    // dispatch(departmentAPI.endpoints.getDepartment.initiate({ domain }));



}
