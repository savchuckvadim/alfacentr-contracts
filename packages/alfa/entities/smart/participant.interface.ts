import { EntityTypeIdEnum, SmartStageEnum } from "./smart.interface"

export enum AlfaParticipantSmartItemUserFieldsEnum {
    ufCrm12AccountantGos = 'ufCrm12AccountantGos',
    ufCrm12AccountantMedical = 'ufCrm12AccountantMedical',
    ufCrm12Zakupki = 'ufCrm12Zakupki',
    ufCrm12Kadry = 'ufCrm12Kadry',
    ufCrm12Days = 'ufCrm12Days',
    ufCrm12Format = 'ufCrm12Format',
    ufCrm12AddressForUdost = 'ufCrm12AddressForUdost',
    ufCrm12Phone = 'ufCrm12Phone',
    ufCrm12Email = 'ufCrm12Email',
    ufCrm12Comment = 'ufCrm12Comment',
    ufCrm12IsPpk = 'ufCrm12IsPpk',
    ufCrm12Name = 'ufCrm12Name',
    ufCrm12Corruption = 'ufCrm12Corruption',

}

export enum BxParticipantsDataKeys {
    name = 'name',
    email = 'email',
    address_for_udost = 'address_for_udost',
    phone = 'phone',
    comment = 'comment',
    format = 'format',
    format_v2 = 'format_v2',
    is_ppk = 'is_ppk',
    accountant_gos = 'accountant_gos',
    accountant_medical = 'accountant_medical',
    zakupki = 'zakupki',
    kadry = 'kadry',
    corruption = 'corruption',
    days = 'days'
}

export enum BxParticipantsFieldNameEnum {
    name = 'ФИО',
    email = 'E-mail',
    address_for_udost = 'Адрес для отправки удостоверения',
    phone = 'Телефон',
    comment = 'Комментарий',
    format = 'Формат участия',
    format_v2 = 'Формат участия 2',
    is_ppk = 'Участвует в ППК',
    accountant_gos = 'Программы повышения квалификации для главных бухгалтеров и бухгалтеров бюджетной сферы',
    accountant_medical = 'Программы повышения квалификации для главных бухгалтеров и бухгалтеров государственного учреждения здравоохранения',
    zakupki = 'Программы повышения квалификации для специалистов по закупкам',
    kadry = 'Программы повышения квалификации для специалистов по кадрам',
    corruption = 'Программы повышения квалификации для специалистов по антикоррупционной деятельности',
    days = 'Дни участия'
}

export class IParticipantBaseField {

    value: string
}

export class IParticipantNameField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name
    code: BxParticipantsDataKeys.name
    name: BxParticipantsFieldNameEnum.name
    type: 'string'

}

export class IParticipantEmailField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email
    code: BxParticipantsDataKeys.email
    name: BxParticipantsFieldNameEnum.email
    type: 'string'
}

export class IParticipantAddressForUdostField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AddressForUdost
    code: BxParticipantsDataKeys.address_for_udost
    name: BxParticipantsFieldNameEnum.address_for_udost
    type: 'string'
}

export class IParticipantPhoneField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone
    code: BxParticipantsDataKeys.phone
    name: BxParticipantsFieldNameEnum.phone
    type: 'string'
}

export class IParticipantCommentField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Comment
    code: BxParticipantsDataKeys.comment
    name: BxParticipantsFieldNameEnum.comment
    type: 'string'
}

export class IParticipantFormatField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Format
    code: BxParticipantsDataKeys.format
    name: BxParticipantsFieldNameEnum.format
    type: 'multiple'
}



export class IParticipantIsPpkField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12IsPpk
    code: BxParticipantsDataKeys.is_ppk
    name: BxParticipantsFieldNameEnum.is_ppk
    type: 'boolean'
}

export class IParticipantAccountantGosField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantGos
    code: BxParticipantsDataKeys.accountant_gos
    name: BxParticipantsFieldNameEnum.accountant_gos
    type: 'multiple'
}

export class IParticipantAccountantMedicalField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantMedical
    code: BxParticipantsDataKeys.accountant_medical
    name: BxParticipantsFieldNameEnum.accountant_medical
    type: 'multiple'
}

export class IParticipantZakupkiField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Zakupki
    code: BxParticipantsDataKeys.zakupki
    name: BxParticipantsFieldNameEnum.zakupki
    type: 'multiple'
}

export class IParticipantKadryField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Kadry
    code: BxParticipantsDataKeys.kadry
    name: BxParticipantsFieldNameEnum.kadry
    type: 'multiple'
}

export class IParticipantCorruptionField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Corruption
    code: BxParticipantsDataKeys.corruption
    name: BxParticipantsFieldNameEnum.corruption
    type: 'multiple'
}

export class IParticipantDaysField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Days
    code: BxParticipantsDataKeys.days
    name: BxParticipantsFieldNameEnum.days
    type: 'multiple'
}
export const fieldTypes = {
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Days]: {
        name: BxParticipantsFieldNameEnum.days,
        code: BxParticipantsDataKeys.days,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Days,
        type: 'multiple'

    },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name]: {
        name: BxParticipantsFieldNameEnum.name,
        code: BxParticipantsDataKeys.name,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name,
        type: 'string'
    },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email]: {
        name: BxParticipantsFieldNameEnum.email,
        code: BxParticipantsDataKeys.email,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email,
        type: 'string'
    },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AddressForUdost]: {
        name: BxParticipantsFieldNameEnum.address_for_udost,
        code: BxParticipantsDataKeys.address_for_udost,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AddressForUdost,
        type: 'string'
    },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone]: {
        name: BxParticipantsFieldNameEnum.phone,
        code: BxParticipantsDataKeys.phone,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone,
        type: 'string'
    },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Comment]: {
        name: BxParticipantsFieldNameEnum.comment,
        code: BxParticipantsDataKeys.comment,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Comment,
        type: 'string'
    },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Format]: {
        name: BxParticipantsFieldNameEnum.format,
        code: BxParticipantsDataKeys.format,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Format,
        type: 'multiple'
    },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12IsPpk]: {
        name: BxParticipantsFieldNameEnum.is_ppk,
        code: BxParticipantsDataKeys.is_ppk,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12IsPpk,
        type: 'boolean'
    },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantGos]: {
        name: BxParticipantsFieldNameEnum.accountant_gos,
        code: BxParticipantsDataKeys.accountant_gos,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantGos,
        type: 'multiple'
    },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantMedical]: {
        name: BxParticipantsFieldNameEnum.accountant_medical,
        code: BxParticipantsDataKeys.accountant_medical,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantMedical,
        type: 'multiple'
    },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Zakupki]: {
        name: BxParticipantsFieldNameEnum.zakupki,
        code: BxParticipantsDataKeys.zakupki,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Zakupki,
        type: 'multiple'
    },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Kadry]: {
        name: BxParticipantsFieldNameEnum.kadry,
        code: BxParticipantsDataKeys.kadry,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Kadry,
        type: 'multiple'
            },
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Corruption]: {
        name: BxParticipantsFieldNameEnum.corruption,
        code: BxParticipantsDataKeys.corruption,
        bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Corruption,
        type: 'multiple'
    },
}


export type IParticipantField<T extends AlfaParticipantSmartItemUserFieldsEnum> = T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name ? IParticipantNameField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email ? IParticipantEmailField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AddressForUdost ? IParticipantAddressForUdostField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone ? IParticipantPhoneField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Comment ? IParticipantCommentField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Format ? IParticipantFormatField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12IsPpk ? IParticipantIsPpkField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantGos ? IParticipantAccountantGosField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantMedical ? IParticipantAccountantMedicalField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Zakupki ? IParticipantZakupkiField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Kadry ? IParticipantKadryField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Corruption ? IParticipantCorruptionField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Days ? IParticipantDaysField : never;

export interface IParticipant {
    id: number
    stage: SmartStageEnum
    entityTypeId: EntityTypeIdEnum.PARTICIPANT

    fields: IParticipantField<AlfaParticipantSmartItemUserFieldsEnum>[]

}

