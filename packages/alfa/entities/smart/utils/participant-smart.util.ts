import { AlfaParticipantSmartItemUserFieldsEnum, fieldTypes, IParticipant, IParticipantField } from "../participant.interface";
import { EntityTypeIdEnum, IAlfaParticipantSmartItem, SmartStageEnum } from "../smart.interface";



export const getParticipant = (smart: IAlfaParticipantSmartItem): IParticipant => {
    const participantFields: IParticipantField<AlfaParticipantSmartItemUserFieldsEnum>[] = []
    for (const key in smart) {
        const fieldInEnum = Object.values(AlfaParticipantSmartItemUserFieldsEnum).find(enumValue => enumValue === key)
        if (fieldInEnum) {
            const targetKey = key as AlfaParticipantSmartItemUserFieldsEnum
            const fieldValue = smart[targetKey]
            const field = {
                bitrixId: key,
                code: fieldTypes[key]?.code,
                name: fieldTypes[key]?.name,
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


