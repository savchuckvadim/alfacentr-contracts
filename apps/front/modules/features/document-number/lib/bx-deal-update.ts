import {
    getCurrentDocumentNumberFieldData,
    getDynamicPrefixFieldData,
} from '@/modules/entities';
import { Bitrix } from '@bitrix/index';

export const updateBxDeal = async (
    dealId: number,
    prefix: string,
    number: string | number,
) => {
    const bitrix = Bitrix.getService();
    const dynamicPrefixField = getDynamicPrefixFieldData();
    const currentDocumentNumberField = getCurrentDocumentNumberFieldData();

    const prefixBitrixId = dynamicPrefixField.bitrixId;
    const currentDocumentNumberBitrixId = currentDocumentNumberField.bitrixId;
    const fields = {
        [prefixBitrixId]: prefix,
        [currentDocumentNumberBitrixId]: number,
    };

    const result = await bitrix.deal.update(dealId, fields);

    return result;
};
