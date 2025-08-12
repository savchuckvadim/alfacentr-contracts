import { documentFields, EnumDealDocumentFieldCode } from '@alfa/entities';
import { Bitrix, IBXDeal } from '@bitrix/index';

export const getCurrentRq = (deal: IBXDeal): string | undefined => {
    const currentRq =
        deal[documentFields[EnumDealDocumentFieldCode.CURRENT_RQ].bitrixId];
    return currentRq as string | undefined;
};

export const setCurrentRq = async (dealId: number, rqId: string) => {
    const bitrix = Bitrix.getService();
    await bitrix.deal.update(dealId, {
        [documentFields[EnumDealDocumentFieldCode.CURRENT_RQ].bitrixId]: rqId,
    });
    return rqId;
};
