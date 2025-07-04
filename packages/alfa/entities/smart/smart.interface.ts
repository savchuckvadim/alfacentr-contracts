import { AlfaParticipantSmartItemUserFieldsEnum } from "./participant.interface"

export enum EntityTypeIdEnum {
    PARTICIPANT = 1036,

}
export enum CategoryIdEnum {
    PARTICIPANT = 26,
}
export enum StageBaseIdEnum {
    NEW = 'NEW', //Начало
    PREPARATION = 'PREPARATION', //Подготовка
    CLIENT = 'CLIENT', //Подготовка завершена
    DONE = 'UC_JLSIU6', //Подтвержден
    SUCCESS = 'SUCCESS', //Подготовка завершена
    FAIL = 'FAIL', //Подготовка завершена
}
export enum SmartStageEnum {
    NEW = `DT${EntityTypeIdEnum.PARTICIPANT}_${CategoryIdEnum.PARTICIPANT}:${StageBaseIdEnum.NEW}`, //Начало
    PREPARATION = `DT${EntityTypeIdEnum.PARTICIPANT}_${CategoryIdEnum.PARTICIPANT}:${StageBaseIdEnum.PREPARATION}`, //Подготовка
    CLIENT = `DT${EntityTypeIdEnum.PARTICIPANT}_${CategoryIdEnum.PARTICIPANT}:${StageBaseIdEnum.CLIENT}`, //Подготовка завершена
    DONE = `DT${EntityTypeIdEnum.PARTICIPANT}_${CategoryIdEnum.PARTICIPANT}:${StageBaseIdEnum.DONE}`, //Подтвержден
    SUCCESS = `DT${EntityTypeIdEnum.PARTICIPANT}_${CategoryIdEnum.PARTICIPANT}:${StageBaseIdEnum.SUCCESS}`, //Подготовка завершена
    FAIL = `DT${EntityTypeIdEnum.PARTICIPANT}_${CategoryIdEnum.PARTICIPANT}:${StageBaseIdEnum.FAIL}`, //Подготовка завершена
}

export interface IAlfaParticipantSmartItem {
    entityTypeId: EntityTypeIdEnum.PARTICIPANT
    id?: number
    xmlId?: string
    title?: string
    createdBy?: number
    updatedBy?: number
    movedBy?: number
    createdTime?: string
    updatedTime?: string
    movedTime?: string
    categoryId?: CategoryIdEnum.PARTICIPANT
    opened?: string
    stageId?: SmartStageEnum
    previousStageId?: string
    begindate?: string
    closedate?: string
    companyId?: number
    contactId?: number
    opportunity: number
    isManualOpportunity: string
    taxValue: number
    currencyId: string
    mycompanyId: number
    sourceId?: string
    sourceDescription?: string
    webformId?: number
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantGos]?: string[]
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantMedical]?: string[]
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Zakupki]?: string[]
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Kadry]?: string[]
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Days]?: string[]
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Format]?: string[]
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AddressForUdost]?: string
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone]?: string
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email]?: string
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Comment]?: string
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12IsPpk]?: string
    [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name]?: string
    assignedById: number
    lastActivityBy: number
    lastActivityTime: string
    lastCommunicationTime: string
    lastCommunicationCallTime: string
    lastCommunicationEmailTime: string
    lastCommunicationImolTime: string
    lastCommunicationWebformTime: string
    parentId2?: number //dealId
    parentId3?: number //companyId
    parentId4?: number //contactId
    utmSource: string
    utmMedium: string
    utmCampaign: string
    utmContent: string
    utmTerm: string
    observers: number[]
    contactIds: number[]


}

