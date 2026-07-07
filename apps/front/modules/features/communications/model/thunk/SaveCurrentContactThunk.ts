import { AppDispatch, RootState, ThunkExtraArgument } from "@/modules/app/model/store";
import { BxDealDataKeys } from "@alfa/entities";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { BxDealCurrentContactService } from "../../services/bx-deal-contact-flow.service";

const getSaveContactDataByState = (state: RootState):
 {
    dealId: number;
    email: string;
    name: string;
    phone: string;
    userId: number;
    dealFields: Record<string, string | number>;
} | null => {
    const currentDeal = state.app.bitrix.deal;

    const dealIdRaw = currentDeal?.ID;
    if (!dealIdRaw) {
        return null;
    }
    const dealId = Number(dealIdRaw);
    const dealState = state.deal;
    const getFieldByCode = (code: BxDealDataKeys) => {
        return dealState.dealData?.find(field => field.code === code);
    };

    const userId = currentDeal?.ASSIGNED_BY_ID;
    const emailData = getFieldByCode(BxDealDataKeys.exchange_doc_email);
    const phoneData = getFieldByCode(BxDealDataKeys.exchange_doc_phone);
    const nameData = getFieldByCode(BxDealDataKeys.exchange_doc_name);

    if (!emailData?.value || !nameData?.value || !phoneData?.value || !userId) {
        return null;
    }
    const email = emailData.value as string;
    const name = nameData.value as string;
    const phone = phoneData.value as string;
    const userIdNum = Number(userId);

    // актуальный email сделки — уходит в bitrix тем же deal.update,
    // которым привязывается контакт; name/phone обновляются в сделке
    // сразу при своём изменении (CommunicationsDealListener)
    const dealFields: Record<string, string | number> = {
        [emailData.bitrixId]: email,
    };

    return { dealId, email, name, phone, userId: userIdNum, dealFields };
};
export const saveCurrentContact = createAsyncThunk<
    { email: string; name: string; phone: string; userId: number },
    void,
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>(
    'communications/SaveCurrentContact',
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        const saveContactData = getSaveContactDataByState(state);
        if (!saveContactData) {
            return rejectWithValue('Contact data is not defined');
        }
        const { dealId, email, name, phone, userId, dealFields } =
            saveContactData;

        const currentContactService = new BxDealCurrentContactService();

        await currentContactService.flow({
            dealId,
            email,
            name,
            phone,
            userId,
            dealFields,
        });
        return { email, name, phone, userId };
    },
);
