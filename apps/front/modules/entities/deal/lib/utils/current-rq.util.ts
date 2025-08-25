import { documentFields, EnumDealDocumentFieldCode } from '@alfa/entities';
import { Bitrix, IBXDeal } from '@bitrix/index';

export const getCurrentRq = (deal: IBXDeal): number | undefined => {
    const currentRq =
        deal[documentFields[EnumDealDocumentFieldCode.CURRENT_RQ].bitrixId];

    return currentRq
        ? Number(currentRq)
        : undefined;
};

export const setCurrentRq = async (dealId: number, rqId: number) => {
    const bitrix = Bitrix.getService();
    const response = await bitrix.deal.update(dealId, {
        [documentFields[EnumDealDocumentFieldCode.CURRENT_RQ].bitrixId]: rqId,
    });
    debugger;
    return rqId;
};
