import { appActions } from "@/modules/app/model/AppSlice";
import { RootState } from "@/modules/app/model/store";

import { createListenerMiddleware } from "@reduxjs/toolkit";
import { isAnyOf } from "@reduxjs/toolkit";
import { fetchBXRQ } from "@workspace/bx-rq";

export const appListener = createListenerMiddleware();

appListener.startListening({
    matcher: isAnyOf(appActions.setAppData),
    effect: async (action, listenerApi) => {
        const { dispatch, getState } = listenerApi;
        const state = getState() as RootState;
        const domain = state.app.domain;
        const companyId = state.app.bitrix.company?.ID;
debugger
        if (domain && companyId) {
            dispatch(fetchBXRQ(domain, companyId) as any)
        }
    }
})