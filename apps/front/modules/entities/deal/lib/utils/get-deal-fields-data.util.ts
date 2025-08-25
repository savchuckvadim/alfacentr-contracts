import {
    BxDealData,
    BxDealDataKeys,
    TDealData,
    TField,
    TFieldSelect,
} from '@alfa/entities';
import { IBXDeal } from '@bitrix/index';
import { IDealFieldsData } from '../../type/deal-field.type';
import { API_METHOD, backAPI, EBACK_ENDPOINT } from '@workspace/api';

export const getDealFieldsData = async (deal: IBXDeal): Promise<IDealFieldsData[]> => {



    const backResponse = await backAPI.service<{
        alfaFieldData: { [key in BxDealDataKeys]: IDealFieldsData }
    }>(
        EBACK_ENDPOINT.SEMINAR_GET_FIELDS_DATA,
        API_METHOD.POST,
        {
            auth: {
                domain: 'alfacentr.bitrix24.ru',
            },

        }
    )

    const fieldsData = backResponse.data?.alfaFieldData;

    // const backDealValuesResponse = await backAPI.service<{
    //     [key in BxDealDataKeys]: IDealFieldsData
    // }>(
    //     EBACK_ENDPOINT.SEMINAR_GET_DEAL_VALUES,
    //     API_METHOD.POST,
    //     {
    //         auth: {
    //             domain: 'alfacentr.bitrix24.ru',
    //         },

    //     },
    //     `${deal.ID}`
    // )
    // const dealValues = backDealValuesResponse.data;



    const fields: IDealFieldsData[] = [];
    for (const key in BxDealData) {
        if (key === 'participants') {
            continue;
        }
        const typedKey = key as BxDealDataKeys;
        const currentFieldData = BxDealData[typedKey] as TFieldSelect | TField;
        const bitrixId = currentFieldData.bitrixId;
        const field = {
            ...currentFieldData,
            // [key]: BxDealData[typedKey],
            value: deal[bitrixId],
        } as IDealFieldsData;

        if (field.type === 'enumeration' && fieldsData) {

            (field as TFieldSelect).list = (fieldsData[typedKey] as TFieldSelect)?.list || [];
        }
        fields.push(field);
    }

    return fields;
};
