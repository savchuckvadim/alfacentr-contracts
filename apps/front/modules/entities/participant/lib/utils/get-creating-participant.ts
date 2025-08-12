import {
    AlfaParticipantSmartItemUserFieldsEnum,
    BxParticipantsDataKeys,
    BxParticipantsFieldNameEnum,
    EntityTypeIdEnum,
    IParticipant,
    SmartStageEnum,
} from '@alfa/entities';

export const getCreatingParticipant = (): IParticipant => {
    return {
        entityTypeId: EntityTypeIdEnum.PARTICIPANT,
        id: 0,
        stage: SmartStageEnum.NEW,
        fields: [
            {
                bitrixId:
                    AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantGos,
                code: BxParticipantsDataKeys.accountant_gos,
                name: BxParticipantsFieldNameEnum.accountant_gos,
                type: 'multiple',
                value: [] as string[],
            },
            {
                bitrixId:
                    AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantMedical,
                code: BxParticipantsDataKeys.accountant_medical,
                name: BxParticipantsFieldNameEnum.accountant_medical,
                type: 'multiple',
                value: [] as string[],
            },
            {
                bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Zakupki,
                code: BxParticipantsDataKeys.zakupki,
                name: BxParticipantsFieldNameEnum.zakupki,
                type: 'multiple',
                value: [] as string[],
            },
            {
                bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Kadry,
                code: BxParticipantsDataKeys.kadry,
                name: BxParticipantsFieldNameEnum.kadry,
                type: 'multiple',
                value: [] as string[],
            },
            {
                bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Days,
                code: BxParticipantsDataKeys.days,
                name: BxParticipantsFieldNameEnum.days,
                type: 'multiple',
                value: [] as string[],
            },
            {
                bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Format,
                code: BxParticipantsDataKeys.format,
                name: BxParticipantsFieldNameEnum.format,
                type: 'enumeration',
                value: '19908' as string,
            },
            {
                bitrixId:
                    AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AddressForUdost,
                code: BxParticipantsDataKeys.address_for_udost,
                name: BxParticipantsFieldNameEnum.address_for_udost,
                type: 'string',
                value: '',
            },
            {
                bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone,
                code: BxParticipantsDataKeys.phone,
                name: BxParticipantsFieldNameEnum.phone,
                type: 'string',
                value: '' as string,
            },
            {
                bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email,
                code: BxParticipantsDataKeys.email,
                name: BxParticipantsFieldNameEnum.email,
                type: 'string',
                value: '' as string,
            },
            {
                bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Comment,
                code: BxParticipantsDataKeys.comment,
                name: BxParticipantsFieldNameEnum.comment,
                type: 'string',
                value: '' as string,
            },
            {
                bitrixId:
                    AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Corruption,
                code: BxParticipantsDataKeys.corruption,
                name: BxParticipantsFieldNameEnum.corruption,
                type: 'multiple',
                value: [] as string[],
            },
            {
                bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12IsPpk,
                code: BxParticipantsDataKeys.is_ppk,
                name: BxParticipantsFieldNameEnum.is_ppk,
                type: 'boolean',
                value: 'Y' as string,
            },
            {
                bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name,
                code: BxParticipantsDataKeys.name,
                name: BxParticipantsFieldNameEnum.name,
                type: 'string',
                value: '' as string,
            },
        ],
    };
};
