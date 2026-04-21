import { IS_PROD } from "@/modules/app/consts/app-global";
import { reloadApp } from "@/modules/app/model/AppThunk";
import { AppDispatch, RootState } from "@/modules/app/model/store";

export const getRedirect = (state: RootState, dispatch: AppDispatch): void => {
    const dealId = state.app.bitrix.deal?.ID;
    const link = `https://alfacentr.bitrix24.ru/crm/deal/details/${dealId}/`;
    let needReload = false;
    if (IS_PROD) {
        if (typeof window !== 'undefined' && window.top) {
            window.top.location.replace(link);
        } else {
            needReload = true;
        }
    } else {
        needReload = true;
    }
    if (needReload) {
        dispatch(reloadApp());
    }
};
