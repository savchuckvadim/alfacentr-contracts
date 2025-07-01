import { CategoryIdEnum, EntityTypeIdEnum, IAlfaParticipantSmartItem, SmartStageEnum } from "./smart.interface";

export class SmartEntity {
    smart: IAlfaParticipantSmartItem

    constructor(smart: IAlfaParticipantSmartItem) {
        this.smart = smart
    }

    getSmart() {
        return this.smart
    }

    getStageId() {
        return this.smart.stageId
    }

    static getStageIdByCode(code: SmartStageEnum): SmartStageEnum {
        return `DT${EntityTypeIdEnum.PARTICIPANT}_${CategoryIdEnum.PARTICIPANT}:${code}` as SmartStageEnum
    }

    getStageCategoryId() {
        return this.smart.stageId
    }
    getEntityTypeId() {
        return this.smart.entityTypeId
    }

    getCrmId() {
        return ''

    }

    getFieldBxIdByCode() {
        return ''
    }

    getFieldBxValueByCode() {
        return ''
    }




}