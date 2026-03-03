import {
    BxParticipantsDataKeys,
    CategoryIdEnum,
    EntityTypeIdEnum,
    formatSelect,
    IAlfaParticipantSmartItem,
    isPpkSelect,
    SmartStageEnum,
} from '@alfa/entities';
import { BxDealDataKeys, TDealData } from '@alfa/entities';
import { DealValue } from './deal-values-helper.service';
import { TSmartFieldCode } from '../smart-helper/smart-field-code.helper';

// export const getParticipantProductValuesFromDeal = (
//     dealValues: DealValue[],
// ) => {
//     const prefix = dealValues.find(
//         (value) => value.code === BxDealDataKeys.prefix,
//     )?.value as string;

//     for (const value of dealValues) {
//         if (
//             value.code === BxParticipantsDataKeys.accountant_gos ||
//             value.code === BxParticipantsDataKeys.accountant_medical ||
//             value.code === BxParticipantsDataKeys.zakupki ||
//             value.code === BxParticipantsDataKeys.kadry ||
//             value.code === BxParticipantsDataKeys.corruption
//         ) {
//             if (value) {
//                 console.log(
//                     'getParticipantProductValuesFromDeal'.toUpperCase(),
//                 );
//                 console.log(value);
//             }
//         }
//     }
// };

export const getParticipantValuesFromDeal = (
    dealValues: DealValue[],
    dealId: number,
): IAlfaParticipantSmartItem[] => {
    const prefix = dealValues.find(
        (value) => value.code === BxDealDataKeys.prefix,
    )?.value as string;

    const participants: IAlfaParticipantSmartItem[] = [];
    for (let i = 1; i <= 10; i++) {
        const participant = {} as TDealData;

        let needPushParticipant = false;
        for (const value of dealValues) {
            // if (value.code === BxParticipantsDataKeys.accountant_gos
            //     || value.code === BxParticipantsDataKeys.accountant_medical
            //     || value.code === BxParticipantsDataKeys.zakupki
            //     || value.code === BxParticipantsDataKeys.kadry
            //     || value.code === BxParticipantsDataKeys.corruption

            // ) {
            needPushParticipant = getIsNotEmptyParticipant(dealValues, i);
            if (needPushParticipant) {
                if (value && value.value) {
                    if (
                        value.name.includes(`Участник ${i}`) &&
                        ((i === 1 && !value.name.includes(`Участник 10`)) ||
                            (i === 10 && !value.name.includes(`Участник 1`)) ||
                            (i !== 1 && i !== 10))
                    ) {
                        let formatValue = value.value;
                        if (value.code === BxParticipantsDataKeys.format_v2) {
                            formatValue = formatSelect.find(
                                (item) => item.label === value.value,
                            )?.bitrixId as string;
                        } else if (
                            value.code === BxParticipantsDataKeys.is_ppk
                        ) {
                            formatValue = isPpkSelect.find(
                                (item) => item.label === value.value,
                            )?.bitrixId as string;
                        }

                        const participantField = {
                            name: value.name,
                            code: value.code as BxParticipantsDataKeys,
                            value: formatValue,
                        };
                        participant[participantField.code] = participantField;
                    }
                }
            }
            // }
        }
        if (needPushParticipant) {
            participants.push(getSmartAddData(participant, dealId, i));
        }
    }

    return participants;
};

export const getIsNotEmptyParticipant = (
    dealValues: DealValue[],
    participantIndex: number,
) => {
    let needPushParticipant = false;
    for (const value of dealValues) {
        if (
            value &&
            value.value &&
            value.code !== 'is_ppk' &&
            value.code !== 'format_v2' &&
            value.code !== 'format'
        ) {
            if (
                value.name.includes(`Участник ${participantIndex}`) &&
                ((participantIndex === 1 &&
                    !value.name.includes(`Участник 10`)) ||
                    (participantIndex === 10 &&
                        !value.name.includes(`Участник 1`)) ||
                    (participantIndex !== 1 && participantIndex !== 10))
            ) {
                needPushParticipant = true;
            }
        }
    }
    return needPushParticipant;
};

const getSmartAddData = (
    participant: TDealData,
    dealId: number,
    index: number,
): IAlfaParticipantSmartItem => {
    const smartAddData = {
        title: `Участник ${index}`,
        entityTypeId: EntityTypeIdEnum.PARTICIPANT,
        categoryId: CategoryIdEnum.PARTICIPANT,
        stageId: SmartStageEnum.NEW,
        opportunity: 0,
        isManualOpportunity: 'N',
        taxValue: 0,
        currencyId: 'RUB',
        mycompanyId: 0,
        sourceId: '',
        sourceDescription: '',
        parentId2: dealId,
    } as IAlfaParticipantSmartItem;
    for (const key in participant) {
        if (key in TSmartFieldCode) {
            smartAddData[TSmartFieldCode[key]] = participant[key].value;
        }
    }
    return smartAddData;
};
