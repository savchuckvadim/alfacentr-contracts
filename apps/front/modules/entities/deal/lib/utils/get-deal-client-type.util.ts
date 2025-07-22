import { BxDealDataKeys, TFieldItem, TFieldSelect } from '@alfa/entities';
import { IDealFieldsData } from '../../type/deal-field.type';
import { RQ_TYPE } from '@workspace/bx-rq';

export const getDealClientType = (dealData: IDealFieldsData[]): RQ_TYPE => {
    const clientTypeField = dealData.find(
        field => field.code === BxDealDataKeys.organization_type,
    ) as TFieldSelect;
    const clientTypeValueBitrixId = clientTypeField?.value as string;
    const clientTypeValue = getCurrentListItemValueByBitrixId(
        clientTypeField?.list,
        clientTypeValueBitrixId,
    );
    let result = RQ_TYPE.ORGANIZATION;
    if (clientTypeValue?.includes('Юре')) {
        result = RQ_TYPE.ORGANIZATION;
    } else if (clientTypeValue?.includes('Физ')) {
        result = RQ_TYPE.FIZ;
    }

    return result;
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
