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

}

export class IParticipantEmailField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email
    code: BxParticipantsDataKeys.email
    name: BxParticipantsFieldNameEnum.email
}

export class IParticipantPhoneField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone
    code: BxParticipantsDataKeys.phone
    name: BxParticipantsFieldNameEnum.phone
}

export class IParticipantCommentField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Comment
    code: BxParticipantsDataKeys.comment
    name: BxParticipantsFieldNameEnum.comment
}

export class IParticipantFormatField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Format
    code: BxParticipantsDataKeys.format
    name: BxParticipantsFieldNameEnum.format
}



export class IParticipantIsPpkField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12IsPpk
    code: BxParticipantsDataKeys.is_ppk
    name: BxParticipantsFieldNameEnum.is_ppk
}

export class IParticipantAccountantGosField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantGos
    code: BxParticipantsDataKeys.accountant_gos
    name: BxParticipantsFieldNameEnum.accountant_gos
}

export class IParticipantAccountantMedicalField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantMedical
    code: BxParticipantsDataKeys.accountant_medical
    name: BxParticipantsFieldNameEnum.accountant_medical
}

export class IParticipantZakupkiField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Zakupki
    code: BxParticipantsDataKeys.zakupki
    name: BxParticipantsFieldNameEnum.zakupki
}

export class IParticipantKadryField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Kadry
    code: BxParticipantsDataKeys.kadry
    name: BxParticipantsFieldNameEnum.kadry
}

export class IParticipantCorruptionField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Corruption
    code: BxParticipantsDataKeys.corruption
    name: BxParticipantsFieldNameEnum.corruption
}

export class IParticipantDaysField extends IParticipantBaseField {
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Days
    code: BxParticipantsDataKeys.days
    name: BxParticipantsFieldNameEnum.days
}
export const fieldTypes = {
    [BxParticipantsDataKeys.days]: IParticipantDaysField,
    [BxParticipantsDataKeys.name]: IParticipantNameField,
    [BxParticipantsDataKeys.email]: IParticipantEmailField,
    [BxParticipantsDataKeys.phone]: IParticipantPhoneField,
    [BxParticipantsDataKeys.comment]: IParticipantCommentField,
    [BxParticipantsDataKeys.format]: IParticipantFormatField,
    [BxParticipantsDataKeys.is_ppk]: IParticipantIsPpkField,        
    [BxParticipantsDataKeys.accountant_gos]: IParticipantAccountantGosField,
    [BxParticipantsDataKeys.accountant_medical]: IParticipantAccountantMedicalField,
    [BxParticipantsDataKeys.zakupki]: IParticipantZakupkiField,
    [BxParticipantsDataKeys.kadry]: IParticipantKadryField,
    [BxParticipantsDataKeys.corruption]: IParticipantCorruptionField,
}


export type IParticipantField<T extends AlfaParticipantSmartItemUserFieldsEnum> = T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name ? IParticipantNameField :
    T extends AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email ? IParticipantEmailField :
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