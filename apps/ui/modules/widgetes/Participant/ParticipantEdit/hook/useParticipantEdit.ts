import { useAppDispatch, useAppSelector } from "@/modules/app/"

import { useParticipantInfo } from "../../ParticipantInfoCard/hook/useParticipantInfo"
import { useParticipant } from "@/modules/entities"
import { BxParticipantsDataKeys } from "@alfa/entities"

export const useEditParticipant = (participantId: number) => {


    const editable = useAppSelector(state => state.participant.editable)
    const isEditLoading = useAppSelector(state => state.participant.editLoading)
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

    const { problems,
       
     } = useParticipantInfo(participantId)

    const editParticipantTopic = (fieldCode: BxParticipantsDataKeys, value: string) => {
        
        changeEditable(fieldCode, value)

    }
    return {
        isEditLoading,
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