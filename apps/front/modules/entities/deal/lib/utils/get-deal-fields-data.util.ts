import {
    BxDealData,
    BxDealDataKeys,
    BxParticipantsDataKeys,
    TDealData,
    TField,
    TFieldItem,
    TFieldSelect,
    TParticipantData,
} from '@alfa/entities';
import { IBXDeal } from '@bitrix/index';
import { IDealFieldsData } from '../../type/deal-field.type';
import { API_METHOD, backAPI, EBACK_ENDPOINT } from '@workspace/api';
import { BxDealService, DealValue } from '../service/bx-deal-bid.service';

export const getDealFieldsData = async (
    deal: IBXDeal,
): Promise<IDealFieldsData[]> => {
    const backResponse = await backAPI.service<{
        alfaFieldData: { [key in BxDealDataKeys]: IDealFieldsData };
    }>(EBACK_ENDPOINT.SEMINAR_GET_FIELDS_DATA, API_METHOD.POST, {
        auth: {
            domain: 'alfacentr.bitrix24.ru',
        },
    });

    const fieldsData = backResponse.data?.alfaFieldData;

    const backDealValuesResponse = await backAPI.service<DealValue[]>(
        EBACK_ENDPOINT.SEMINAR_GET_DEAL_VALUES,
        API_METHOD.POST,
        {
            auth: {
                domain: 'alfacentr.bitrix24.ru',
            },
        },
        `${deal.ID}`,
    );
    const dealValues = backDealValuesResponse.data;

    const fields: IDealFieldsData[] = [];
    for (const key in BxDealData) {
        if (key === 'participants') {
            continue;
        }
        const typedKey = key as BxDealDataKeys;

        const currentFieldData = BxDealData[typedKey as keyof TDealData] as TFieldSelect | TField;
        const bitrixId = currentFieldData.bitrixId;
        const field = {
            ...currentFieldData,
            // [key]: BxDealData[typedKey],
            value: deal[bitrixId],
        } as IDealFieldsData;

        if (field.type === 'enumeration' && fieldsData) {
            (field as TFieldSelect).list =
                (fieldsData[typedKey] as TFieldSelect)?.list || [];
        }
        fields.push(field);
    }

    for (const key in BxDealData) {
        if (key !== 'participants') {
            continue;
        }
        const typedKey = key as BxDealDataKeys;

        const currentParticipantData = BxDealData[
            BxDealDataKeys.participants
        ] as unknown as Record<
            1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
            TParticipantData
        >;

        for (const pKey in currentParticipantData) {
            const typedPKey = pKey as unknown as
                | 1
                | 2
                | 3
                | 4
                | 5
                | 6
                | 7
                | 8
                | 9
                | 10;
            const currentParticipant = currentParticipantData[
                typedPKey
            ] as TParticipantData;
            const isNotEmptyParticipant =
                BxDealService.getIsNotEmptyParticipant(
                    dealValues || [],
                    typedPKey,
                );

            if (!isNotEmptyParticipant) {
                continue;
            }

            for (const pfKey in currentParticipant) {
                const currentFieldData = (currentParticipant as any)[pfKey] as
                    | TFieldSelect
                    | TField;

                const bitrixId = currentFieldData.bitrixId;
                const field = {
                    ...currentFieldData,
                    // [key]: BxDealData[typedKey],
                    value: deal[bitrixId],
                } as IDealFieldsData;

                if (
                    field.code === BxParticipantsDataKeys.format ||
                    field.code === BxParticipantsDataKeys.format_v2
                ) {
                }

                if (field.type === 'enumeration' && fieldsData) {
                    const fldWithValue = dealValues?.find(
                        item => item.bitrixId === field.bitrixId,
                    );

                    if (fldWithValue) {
                        if (fldWithValue.code === BxParticipantsDataKeys.days) {
                            (field as TFieldSelect).list =
                                (fldWithValue as DealValue)?.listItem &&
                                Array.isArray(
                                    (fldWithValue as DealValue)?.listItem,
                                )
                                    ? ((fldWithValue as DealValue)
                                          ?.listItem as TFieldItem[])
                                    : (fldWithValue as DealValue)?.listItem &&
                                        !Array.isArray(
                                            (fldWithValue as DealValue)
                                                ?.listItem,
                                        )
                                      ? ([
                                            (fldWithValue as DealValue)
                                                ?.listItem,
                                        ] as TFieldItem[])
                                      : ((field as TFieldSelect)
                                            .list as TFieldItem[]);
                        } else {
                            (field as TFieldSelect).list = (
                                fldWithValue as DealValue
                            )?.listItem
                                ? ([
                                      (fldWithValue as DealValue)?.listItem,
                                  ] as TFieldItem[])
                                : (field as TFieldSelect).list;
                        }
                    }
                }
                fields.push(field);
            }
        }
    }
    return fields;
};
