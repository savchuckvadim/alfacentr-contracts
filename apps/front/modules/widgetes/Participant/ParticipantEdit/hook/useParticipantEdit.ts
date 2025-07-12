import { useAppDispatch, useAppSelector } from "@/modules/app/"

import { useParticipantInfo } from "../../ParticipantInfoCard/hook/useParticipantInfo"
import { useParticipant } from "@/modules/entities"
import { BxParticipantsDataKeys } from "@alfa/entities"

export const useEditParticipant = (participantId: number) => {


    const editable = useAppSelector(state => state.participant.editable)
    const {

        name,
        email,
        phone,
        format,
        isPpk,
        programs,
        activateEditable,
        cancelEditable,
        changeEditable,
        deleteParticipant,
        updateParticipant,
        formatParticipantPrograms,
      
    } = useParticipant(participantId)

    const { problems } = useParticipantInfo(participantId)

    const editParticipantTopic = (fieldCode: BxParticipantsDataKeys, value: string) => {
        debugger
        changeEditable(fieldCode, value)

    }
    return {
        editable,
        problems,
        name,
        email,
        phone,
        format,
        isPpk,
        programs,
        activateEditable,
        cancelEditable,
        changeEditable,
        deleteParticipant,
        updateParticipant,
        editParticipantTopic,
        formatParticipantPrograms,
       
    }
}