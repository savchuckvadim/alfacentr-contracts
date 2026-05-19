import { documentFields, EnumDealDocumentFieldCode, TFieldItem } from "@alfa/entities";
import { IBXDeal } from "@bitrix/index";

export const getCurrentByDeal = (deal: IBXDeal): TFieldItem | null => {

    const bankField = documentFields[EnumDealDocumentFieldCode.BANK];
    if (!bankField) {
        return null;
    }
    const currentItemBitrixId = deal[bankField.bitrixId];

    if (!currentItemBitrixId) {
        return null;
    }

    const currentItem = bankField.list.find(item => Number(item.bitrixId) === Number(currentItemBitrixId));
    if (!currentItem) {
        return null;
    }

    return currentItem;
};
