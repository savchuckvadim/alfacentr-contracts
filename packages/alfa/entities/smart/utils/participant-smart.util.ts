import { AlfaParticipantSmartItemUserFieldsEnum, fieldTypes, IParticipant, IParticipantField } from "../participant.interface";
import { EntityTypeIdEnum, IAlfaParticipantSmartItem, SmartStageEnum } from "../smart.interface";



export const getParticipant = (smart: IAlfaParticipantSmartItem): IParticipant => {
    const participantFields: IParticipantField<AlfaParticipantSmartItemUserFieldsEnum>[] = []
    for (const key in smart) {
        const fieldInEnum = Object.values(AlfaParticipantSmartItemUserFieldsEnum).find(enumValue => enumValue === key)
        if (fieldInEnum) {
            const targetKey = key as AlfaParticipantSmartItemUserFieldsEnum
            const fieldValue = smart[targetKey]
            // const test = getNameBySmartFieldBxId(targetKey)
            const field = {
                bitrixId: targetKey,
                code: fieldTypes[targetKey]?.code,
                name: fieldTypes[targetKey]?.name,
                type: fieldTypes[targetKey]?.type,
                value: fieldValue
            } as IParticipantField<typeof targetKey>
            participantFields.push(field)
        }
    }
    return {
        id: smart.id as number,
        stage: smart.stageId as SmartStageEnum,
        entityTypeId: EntityTypeIdEnum.PARTICIPANT,
        fields: participantFields
    }
}

const getNameBySmartFieldBxId = (fieldId: AlfaParticipantSmartItemUserFieldsEnum) => {
    console.log("fieldTypes[fieldId]", fieldTypes[fieldId])
    console.log("fieldTypes[fieldId]?.name", fieldTypes[fieldId]?.name)
    console.log("fieldTypes[fieldId]?.code", fieldTypes[fieldId]?.code)
    console.log("fieldTypes[fieldId]?.bitrixId", fieldTypes[fieldId]?.bitrixId)

    const item = fieldTypes[fieldId]
    return item?.name
}


