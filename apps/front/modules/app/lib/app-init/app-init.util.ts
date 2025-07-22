import { Bitrix } from '@bitrix/bitrix';
import { TESTING_DOMAIN, TESTING_USER } from '../../consts/app-global';
import { AppDispatch, AppGetState } from '../../model/store';
import { WSClient as WSClientWorkspace } from '@workspace/ws';
import { fetchProducts, setParticipants } from '@/modules/entities';
import { setDealData } from '@/modules/entities/deal/model/DealSlice';
import { getDealFieldsData } from '@/modules/entities/deal/lib/utils/get-deal-fields-data.util';
import { wsInit } from '../../model/queue-ws-ping-test/QueueWsPingListener';
import { appActions } from '../../model/AppSlice';
import { bitrixInit } from '../bitrix-init/bitrix-init.util';
import { WSClient } from '@/modules/shared/Websocket/ws-client';

export const appInit = async (
    dispatch: AppDispatch,
    getState: AppGetState,
    getWSClient: () => WSClientWorkspace,
    loadingCallBack: () => void,
) => {
    const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER);
    console.log('bitrix', bitrix.api);
    console.log('bitrix initialized', bitrix.api.getInitializedData());
    const { domain, user } = bitrix.api.getInitializedData();
    const wsService = new WSClient(Number(user.ID), domain); // создаём сокет
    wsService.init(); // <- здесь создаёшь сокет

    dispatch(
        wsInit({
            userId: Number(user.ID),
            domain,
        }),
    );
    // подписываем все события
    console.log('user');

    console.log(user);

    const { deal, company, participants } = (await bitrixInit()) || {};

    if (deal && company) {
        Promise.all([
            dispatch(setParticipants(participants)),
            dispatch(fetchProducts(deal.ID.toString()) as any),
            dispatch(setDealData(getDealFieldsData(deal))),
            // dispatch(setFetchedProducts(rows))
        ]);
    }

    if (deal && company) {
        dispatch(
            appActions.setAppData({
                domain,
                user,
                deal,
                company,
            }),
        );
    }

    loadingCallBack();

    // dispatch(departmentAPI.endpoints.getDepartment.initiate({ domain }));
};
