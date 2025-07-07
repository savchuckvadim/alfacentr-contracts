import { BxDealData, BxDealDataKeys, TDealData, TField, TFieldSelect } from "@alfa/entities";
import { IBXDeal } from "@bitrix/index";
import { IDealFieldsData } from "../../type/deal-field.type";


export const getDealFieldsData = (deal: IBXDeal): IDealFieldsData[] => {

    const fields: IDealFieldsData[] = []
    for (const key in BxDealData) {

        if (key === 'participants') {
            continue;
        }
        const typedKey = key as BxDealDataKeys
        const currentFieldData = BxDealData[typedKey] as TFieldSelect | TField
        const bitrixId = currentFieldData.bitrixId
        const field = {
            ...currentFieldData,
            // [key]: BxDealData[typedKey],
            value: deal[bitrixId],
        }as IDealFieldsData
        fields.push(field)
    }
    debugger
    return fields;

}