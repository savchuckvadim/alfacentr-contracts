import { IBXDeal } from "@bitrix/index";
import { IAlfaProduct } from "../model/ProductSlice";
import { BxDealData, BxDealDataKeys, TDealData, TField, TFieldSelect } from "@alfa/entities";

export const getCompanyFields = (product: IAlfaProduct) => {
    return product.fields.filter(field => field.userType === 'company');
}

export const getProductFields = (product: IAlfaProduct) => {
    const { price, quantity, productName } = product;
    return product.fields.filter(field => field.userType === 'product');
}

export interface IDealFieldsData extends Partial<TDealData> {
   
    value: string | string[]
}

export const getDealFieldsFields = (deal: IBXDeal): IDealFieldsData[] => {

    const fields: IDealFieldsData[] = []
    for (const key in BxDealData) {

        if (key !== 'participants') {
            continue;
        }
        const typedKey = key as BxDealDataKeys
        const currentFieldData = BxDealData[typedKey] as TFieldSelect | TField
        const bitrixId = currentFieldData.bitrixId
        const field = {
            [key]: BxDealData[typedKey],
            value: deal[bitrixId],
        }as IDealFieldsData
        fields.push(field)
    }
    return fields;

}