import { Bitrix } from '@bitrix/index';
import { IDealFieldsData } from '../../type/deal-field.type';

export const updateDeal = async (
    dealId: number,
    value: string | number,
    field: IDealFieldsData,
) => {
    const bitrix = Bitrix.getService();
    await bitrix.deal.update(dealId, {
        [field.bitrixId]: value,
    });
};
