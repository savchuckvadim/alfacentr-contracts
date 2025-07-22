import {
    IParticipant,
    AlfaParticipantSmartItemUserFieldsEnum,
    BxParticipantsFieldNameEnum,
    BxParticipantsDataKeys,
    getParticipantSelectItemByValue,
} from '@alfa/entities';

export const getParticipantFieldValue = (
    participant: IParticipant,
    fieldId: AlfaParticipantSmartItemUserFieldsEnum,
): string => {
    const field = participant.fields.find(f => f.bitrixId === fieldId);
    if (!field || field.value == null) {
        return '';
    }

    if (Array.isArray(field.value)) {
        return field.value.filter(Boolean).join(', ');
    }

    return String(field.value);
};

export const getParticipantName = (participant: IParticipant): string => {
    return getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name,
    );
};

export const getParticipantEmail = (participant: IParticipant): string => {
    return getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email,
    );
};

export const getParticipantPhone = (participant: IParticipant): string => {
    return getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone,
    );
};

export const getParticipantAddress = (participant: IParticipant): string => {
    return getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AddressForUdost,
    );
};

export const getParticipantComment = (participant: IParticipant): string => {
    return getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Comment,
    );
};

export const getParticipantFormat = (participant: IParticipant): string => {
    const value = getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Format,
    );
    let result =
        getParticipantSelectItemByValue(BxParticipantsDataKeys.format, value)
            ?.label ?? 'Не выбрано';

    // const value = getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Format);
    // switch (value) {
    //     case '19908':
    //         result = 'Очно'
    //         break
    //     case '19910':
    //         result = 'Онлайн'
    //         break
    //     case '19912':
    //         result = 'Пойду только на ППК'
    //         break
    // }
    return result;
};

export const getParticipantIsPpk = (participant: IParticipant): boolean => {
    const value = getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12IsPpk,
    );
    let isCheckPpk = value === '1' || value === 'true' || value === 'Y';
    participant.fields.forEach(field => {
        if (
            field.code === BxParticipantsDataKeys.accountant_gos ||
            field.code === BxParticipantsDataKeys.accountant_medical ||
            field.code === BxParticipantsDataKeys.zakupki ||
            field.code === BxParticipantsDataKeys.kadry ||
            field.code === BxParticipantsDataKeys.corruption
        ) {
            if (field.value && field.value.length > 0) {
                isCheckPpk = true;
            }
        }
    });
    return isCheckPpk;
};

export const getParticipantDays = (participant: IParticipant): string => {
    return getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Days,
    );
};

// Функция для получения всех программ участника
export const getParticipantPrograms = (
    participant: IParticipant,
): {
    type: BxParticipantsFieldNameEnum;
    value: string;
}[] => {
    const programs: {
        type: BxParticipantsFieldNameEnum;
        value: string;
    }[] = [];

    const accountantGos = getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantGos,
    );
    const accountantMedical = getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantMedical,
    );
    const zakupki = getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Zakupki,
    );
    const kadry = getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Kadry,
    );
    const corruption = getParticipantFieldValue(
        participant,
        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Corruption,
    );

    if (accountantGos)
        programs.push({
            type: BxParticipantsFieldNameEnum.accountant_gos,
            value: accountantGos,
        });
    if (accountantMedical)
        programs.push({
            type: BxParticipantsFieldNameEnum.accountant_medical,
            value: accountantMedical,
        });
    if (zakupki)
        programs.push({
            type: BxParticipantsFieldNameEnum.zakupki,
            value: zakupki,
        });
    if (kadry)
        programs.push({
            type: BxParticipantsFieldNameEnum.kadry,
            value: kadry,
        });
    if (corruption)
        programs.push({
            type: BxParticipantsFieldNameEnum.corruption,
            value: corruption,
        });

    return programs;
};

// Функция для форматирования программ в читаемый вид
export const formatParticipantPrograms = (
    participant: IParticipant,
): string => {
    const programs = getParticipantPrograms(participant);
    if (programs.length === 0) return 'Не выбрано';

    return programs
        .map(program => {
            let shortTypeName = program.type as string;
            // Сокращаем длинные названия программ
            if (
                program.type.includes(
                    'главных бухгалтеров и бухгалтеров бюджетной сферы',
                )
            ) {
                shortTypeName = 'Бухгалтеры бюджетной сферы';
            }
            if (
                program.type.includes(
                    'главных бухгалтеров и бухгалтеров государственного учреждения здравоохранения',
                )
            ) {
                shortTypeName = 'Бухгалтеры здравоохранения';
            }
            if (program.type.includes('специалистов по закупкам')) {
                shortTypeName = 'Специалисты по закупкам';
            }
            if (program.type.includes('специалистов по кадрам')) {
                shortTypeName = 'Специалисты по кадрам';
            }
            if (
                program.type.includes(
                    'специалистов по антикоррупционной деятельности',
                )
            ) {
                shortTypeName = 'Антикоррупционная деятельность';
            }
            return `${shortTypeName}: ${program.value}`;
        })
        .join(', ');
};
