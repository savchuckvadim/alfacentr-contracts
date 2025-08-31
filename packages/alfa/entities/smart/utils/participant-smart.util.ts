import {
    AlfaParticipantSmartItemUserFieldsEnum,
    BxParticipantsDataKeys,
    fieldTypes,
    IParticipant,
    IParticipantField,
    IParticipantSelectItem,
} from '../participant.interface';
import {
    EntityTypeIdEnum,
    IAlfaParticipantSmartItem,
    SmartStageEnum,
} from '../smart.interface';

export const getParticipant = (
    smart: IAlfaParticipantSmartItem,
): IParticipant => {
    const participantFields: IParticipantField<AlfaParticipantSmartItemUserFieldsEnum>[] =
        [];
    for (const key in smart) {
        const fieldInEnum = Object.values(
            AlfaParticipantSmartItemUserFieldsEnum,
        ).find(enumValue => enumValue === key);
        if (fieldInEnum) {
            const targetKey = key as AlfaParticipantSmartItemUserFieldsEnum;
            const fieldValue =
                smart[targetKey as keyof IAlfaParticipantSmartItem];
            // const test = getNameBySmartFieldBxId(targetKey)
            const field = {
                bitrixId: targetKey,
                code: fieldTypes[targetKey]?.code,
                name: fieldTypes[targetKey]?.name,
                type: fieldTypes[targetKey]?.type,
                value: fieldValue,
            } as IParticipantField<typeof targetKey>;
            participantFields.push(field);
        }
    }
    return {
        id: smart.id as number,
        stage: smart.stageId as SmartStageEnum,
        entityTypeId: EntityTypeIdEnum.PARTICIPANT,
        fields: participantFields,
    };
};

// const getNameBySmartFieldBxId = (
//     fieldId: AlfaParticipantSmartItemUserFieldsEnum,
// ) => {

//     const item = fieldTypes[fieldId];
//     return item?.name;
// };

export const formatSelect: IParticipantSelectItem[] = [
    {
        bitrixId: 19908,
        value: '19908',
        label: 'Очно',
        code: 'offline',
    },
    {
        bitrixId: 19910,
        value: '19910',
        label: 'Онлайн',
        code: 'online',
    },

    {
        bitrixId: 19912,
        value: '19912',
        label: 'Пойду только на ППК',
        code: 'ppk_only',
    },
] as const;

export const isPpkSelect: IParticipantSelectItem[] = [
    {
        bitrixId: 'Y',
        value: 'Y',
        label: 'Да',
        code: 'yes',
    },
    {
        bitrixId: 'N',
        value: 'N',
        label: 'Нет',
        code: 'no',
    },
] as const;
export const getParticipantSelect = (
    fieldCode: BxParticipantsDataKeys.format | BxParticipantsDataKeys.is_ppk,
) => {
    switch (fieldCode) {
        case BxParticipantsDataKeys.format:
            return formatSelect;

        case BxParticipantsDataKeys.is_ppk:
            return isPpkSelect;

        default:
            return null;
    }
};

export const getParticipantSelectItemByValue = (
    fieldCode: BxParticipantsDataKeys.format | BxParticipantsDataKeys.is_ppk,
    value: string | number,
) => {
    switch (fieldCode) {
        case BxParticipantsDataKeys.format:
            const searchedInfo = formatSelect.find(
                item => Number(item.value) === Number(value),
            );
            return searchedInfo;

        case BxParticipantsDataKeys.is_ppk:
            const isPpkSearchedInfo = isPpkSelect.find(
                item => item.value === value,
            );
            return isPpkSearchedInfo;

        default:
            return null;
    }
};
