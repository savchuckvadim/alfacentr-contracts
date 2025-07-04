import { BxParticipantsDataKeys, CategoryIdEnum, EntityTypeIdEnum, IAlfaParticipantSmartItem, SmartStageEnum } from "@alfa/entities"
import { BxDealDataKeys, TDealData } from "@alfa/entities"
import { DealValue } from "./deal-values-helper.service"
import { TSmartFieldCode } from "../smart-helper/smart-field-code.helper"

export const getParticipantProductValuesFromDeal = (dealValues: DealValue[]) => {

    const prefix = dealValues.find(value => value.code === BxDealDataKeys.prefix)?.value as string
    console.log('prefix', prefix)
    for (const value of dealValues) {
        if (value.code === BxParticipantsDataKeys.accountant_gos
            || value.code === BxParticipantsDataKeys.accountant_medical
            || value.code === BxParticipantsDataKeys.zakupki
            || value.code === BxParticipantsDataKeys.kadry
            || value.code === BxParticipantsDataKeys.corruption

        ) {
            if (value) {
                console.log('getParticipantProductValuesFromDeal'.toUpperCase())
                console.log(value)

            }
        }
    }
}


export const getParticipantValuesFromDeal = (dealValues: DealValue[], dealId: number): IAlfaParticipantSmartItem[] => {
    console.log('dealValues', dealValues)
    const prefix = dealValues.find(value => value.code === BxDealDataKeys.prefix)?.value as string
    console.log('prefix', prefix)
    const participants: IAlfaParticipantSmartItem[] = []
    for (let i = 1; i <= 10; i++) {
        const participant = {

        } as TDealData

        let needPushParticipant = false
        for (const value of dealValues) {
            // if (value.code === BxParticipantsDataKeys.accountant_gos
            //     || value.code === BxParticipantsDataKeys.accountant_medical
            //     || value.code === BxParticipantsDataKeys.zakupki
            //     || value.code === BxParticipantsDataKeys.kadry
            //     || value.code === BxParticipantsDataKeys.corruption

            // ) {
            if (value.name.includes(`Участник ${i}`)) {
                console.log('value', value)
            }
            if (value) {

                if (value.name.includes(`Участник ${i}`)
                    && (
                        (
                            (i === 1 && !value.name.includes(`Участник 10`)) ||
                            (i === 10 && !value.name.includes(`Участник 1`))
                        ) ||
                        i !== 1 && i !== 10
                    )

                ) {
                    needPushParticipant = true
                    const participantField = {
                        name: value.name,
                        code: value.code as BxParticipantsDataKeys,
                        value: value.value
                    }
                    participant[participantField.code] = participantField

                }

            }
            // }
        }
        if (needPushParticipant) {
            console.log(`PARTCIPANT ${i} VALUES FROM DEAL`, participant)
            participants.push(getSmartAddData(participant, dealId, i))
        }
    }

    return participants
}

const getSmartAddData = (participant: TDealData, dealId: number, index: number): IAlfaParticipantSmartItem => {

    const smartAddData = {
        title: `Участник ${index}`,
        entityTypeId: EntityTypeIdEnum.PARTICIPANT,
        categoryId: CategoryIdEnum.PARTICIPANT,
        stageId: SmartStageEnum.NEW,
        opportunity: 0,
        isManualOpportunity: 'N',
        taxValue: 0,
        currencyId: 'RUB',
        mycompanyId: 0,
        sourceId: '',
        sourceDescription: '',
        parentId2: dealId,

    } as IAlfaParticipantSmartItem
    for (const key in participant) {
        if (key in TSmartFieldCode) {
            smartAddData[TSmartFieldCode[key]] = participant[key].value
        }
    }
    return smartAddData

}