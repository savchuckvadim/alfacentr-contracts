import { CategoryIdEnum, EntityTypeIdEnum, IAlfaParticipantSmartItem, SmartStageEnum } from "./smart.interface";

export class SmartEntity {
    smart!: IAlfaParticipantSmartItem

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
    public getStageInfo() {
        const stageId = this.getStageId() as unknown as keyof  SmartStageEnum
        const stage = SmartStageEnum[stageId]
        let stageType = 'success' as 'new' | 'success' | 'fail' | 'in_progress' | 'preparation'
      
        return { stage, stageType }
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