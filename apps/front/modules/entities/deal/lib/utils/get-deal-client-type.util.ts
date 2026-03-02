import { BxDealDataKeys, TFieldItem, TFieldSelect } from '@alfa/entities';
import { IDealFieldsData } from '../../type/deal-field.type';
import { BXRQ_ENTITY_TYPE, EVSBXRQ, RQ_TYPE } from '@workspace/bx-rq';

export const getDealClientType = (
    dealData: IDealFieldsData[],
): RQ_TYPE | null => {
    const clientTypeField = dealData.find(
        field => field.code === BxDealDataKeys.organization_type,
    ) as TFieldSelect;
    const clientTypeValueBitrixId = clientTypeField?.value as string;
    const clientTypeValue = getCurrentListItemValueByBitrixId(
        clientTypeField?.list,
        clientTypeValueBitrixId,
    );

    let result: RQ_TYPE | undefined = undefined;
    if (clientTypeValue?.includes('Юр')) {
        result = RQ_TYPE.ORGANIZATION;
    } else if (clientTypeValue?.includes('Физ')) {
        result = RQ_TYPE.FIZ;
    }

    return result || null;
};

export const getDealClientTypeBitrixIdByRType = (
    dealData: IDealFieldsData[],
    type: RQ_TYPE,
): number => {
    const clientTypeField = dealData.find(
        field => field.code === BxDealDataKeys.organization_type,
    ) as TFieldSelect;
    const searchedString = type === RQ_TYPE.ORGANIZATION ? 'Юр' : 'Физ';
    const item = clientTypeField?.list.find(item =>
        item.name.includes(searchedString),
    );
    return Number(item?.bitrixId) as number;
};
export const getCurrentListItemByValue = (
    list: TFieldItem[],
    value: string,
) => {
    return list.find(item => item.name === value);
};

export const getCurrentListItemValueByBitrixId = (
    list: TFieldItem[],
    value: string | number,
) => {
    return list.find(item => Number(item.bitrixId) === Number(value))?.name;
};
