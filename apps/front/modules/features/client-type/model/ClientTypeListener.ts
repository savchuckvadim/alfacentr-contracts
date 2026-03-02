import { RootState } from '@/modules/app/model/store';
import { updateFieldValue } from '@/modules/entities/deal/model/DealSlice';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import {
    getFieldValuByCode,
    setCurrentRqItems,
    setFetched,
} from '@workspace/bx-rq';
import {
    getDealClientType,
    getDealClientTypeBitrixIdByRType,
} from '@/modules/entities/deal/lib/utils/get-deal-client-type.util';
import { getCurrentRq, updateDealField } from '@/modules/entities';
import { IBXDeal } from '@bitrix/index';
import { BxDealDataKeys, RQ_TYPE } from '@alfa/entities';

// export const clientTypeListener = createListenerMiddleware();
export function setupClientTypeListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(
            // setDealData,
            updateFieldValue, //если просходит обноаления в полях сделки - bid конкретно интересует тип клиента
            setFetched, // после того как происходит загрузка реквизитов

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
                const currentRqId =
                    getCurrentRq(deal as IBXDeal) || (undefined as undefined);

                const clientType = getDealClientType(dealData);

                const clientFromRqs =
                    bxRqState.rqs?.current?.type || RQ_TYPE.ORGANIZATION;
                //если тип клиента в сделке не определен, то используем тип клиента из реквизитов

                const resultClientType = clientType || clientFromRqs;

                if (!clientType && clientFromRqs) {
                    const clientTypeField = dealData.find(
                        field =>
                            field.code === BxDealDataKeys.organization_type,
                    );
                    if (clientTypeField) {
                        const clientTypeBitrixIdByRqType =
                            getDealClientTypeBitrixIdByRType(
                                dealData,
                                clientFromRqs,
                            );

                        const fieldKey = BxDealDataKeys.organization_type;
                        const value = clientTypeBitrixIdByRqType.toString();

                        dispatch(updateFieldValue({ fieldKey, value }));
                        dispatch(
                            updateDealField({
                                fieldKey,
                                value,
                                field: clientTypeField,
                                dealId: deal?.ID,
                            }),
                        );
                    }
                }

                dispatch(
                    setCurrentRqItems({
                        clientType: resultClientType,
                        currentRqId,
                    }),
                );
                //TODO передать текущий rq_id
            }
        },
    });
}
