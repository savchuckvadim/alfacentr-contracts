import { IParticipant, AlfaParticipantSmartItemUserFieldsEnum, BxParticipantsFieldNameEnum } from "@alfa/entities";

export const getParticipantFieldValue = (participant: IParticipant, fieldId: AlfaParticipantSmartItemUserFieldsEnum): string => {
    const field = participant.fields.find(f => f.bitrixId === fieldId);
    return field?.value || '';
};

export const getParticipantName = (participant: IParticipant): string => {
    return getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name);
};

export const getParticipantEmail = (participant: IParticipant): string => {
    return getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email);
};

export const getParticipantPhone = (participant: IParticipant): string => {
    return getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone);
};

export const getParticipantAddress = (participant: IParticipant): string => {
    return getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AddressForUdost);
};

export const getParticipantComment = (participant: IParticipant): string => {
    return getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Comment);
};

export const getParticipantFormat = (participant: IParticipant): string => {
    return getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Format);
};

export const getParticipantIsPpk = (participant: IParticipant): boolean => {
    const value = getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12IsPpk);
    return value === '1' || value === 'true';
};

export const getParticipantDays = (participant: IParticipant): string => {
    return getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Days);
};

// Функция для получения всех программ участника
export const getParticipantPrograms = (participant: IParticipant): string[] => {
    const programs: string[] = [];
    
    const accountantGos = getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantGos);
    const accountantMedical = getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantMedical);
    const zakupki = getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Zakupki);
    const kadry = getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Kadry);
    const corruption = getParticipantFieldValue(participant, AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Corruption);
    
    if (accountantGos) programs.push(BxParticipantsFieldNameEnum.accountant_gos);
    if (accountantMedical) programs.push(BxParticipantsFieldNameEnum.accountant_medical);
    if (zakupki) programs.push(BxParticipantsFieldNameEnum.zakupki);
    if (kadry) programs.push(BxParticipantsFieldNameEnum.kadry);
    if (corruption) programs.push(BxParticipantsFieldNameEnum.corruption);
    
    return programs;
};

// Функция для форматирования программ в читаемый вид
export const formatParticipantPrograms = (participant: IParticipant): string => {
    const programs = getParticipantPrograms(participant);
    if (programs.length === 0) return 'Не выбрано';
    
    return programs.map(program => {
        // Сокращаем длинные названия программ
        if (program.includes('главных бухгалтеров и бухгалтеров бюджетной сферы')) {
            return 'Бухгалтеры бюджетной сферы';
        }
        if (program.includes('главных бухгалтеров и бухгалтеров государственного учреждения здравоохранения')) {
            return 'Бухгалтеры здравоохранения';
        }
        if (program.includes('специалистов по закупкам')) {
            return 'Специалисты по закупкам';
        }
        if (program.includes('специалистов по кадрам')) {
            return 'Специалисты по кадрам';
        }
        if (program.includes('специалистов по антикоррупционной деятельности')) {
            return 'Антикоррупционная деятельность';
        }
        return program;
    }).join(', ');
}; 