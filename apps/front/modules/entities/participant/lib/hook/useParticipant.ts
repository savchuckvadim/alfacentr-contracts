import { useAppDispatch, useAppSelector } from "@/modules/app/lib/hooks/redux";
import { AlfaParticipantSmartItemUserFieldsEnum, BxParticipantsDataKeys, IParticipant, IParticipantField } from "@alfa/entities";
import { getParticipantEmail, getParticipantFormat, getParticipantIsPpk, getParticipantName, getParticipantPhone } from "../../ui";
import { formatParticipantPrograms } from "../../ui/utils/participant.utils";
import { deleteParticipant as deleteBxParticipant, updateParticipant as updateBxParticipant } from "../../model/ParticipantThunk";
import { addParticipant as addBxParticipant } from "../../model/ParticipantThunk";
import { activateEditable, cancelEditable, changeEditable } from "../../model/PerticipantSlice";


export const useParticipant = (id?: number) => {
    const dispatch = useAppDispatch()
    const { items: participants, loading, error, editLoading } = useAppSelector((state) => state.participant);
    const participantsCount = participants.length
    const participant = participants.find((participant) => participant.id === id)

    const updateParticipant = () => {
        dispatch(updateBxParticipant())
    }

    const deleteParticipant = (participantId: number) => {
        dispatch(deleteBxParticipant(participantId))
    }
    const addParticipant = (fields: Partial<IParticipantField<AlfaParticipantSmartItemUserFieldsEnum>>) => {
        dispatch(addBxParticipant(fields))
    }

    const name = participant ? getParticipantName(participant) : '';
    const email = participant ? getParticipantEmail(participant) : '';
    const phone = participant ? getParticipantPhone(participant) : '';
    const format = participant ? getParticipantFormat(participant) : '';
    const isPpk = participant ? getParticipantIsPpk(participant) : false;
    const programs = participant ? formatParticipantPrograms(participant) : '';

    return {
        participants,
        participant,
        name,
        email,
        phone,
        format,
        isPpk,
        programs,

        loading,
        editLoading,
        error,
        participantsCount,
        getParticipantName,
        getParticipantEmail,
        getParticipantPhone,
        getParticipantFormat,
        getParticipantIsPpk,
        formatParticipantPrograms,

        activateEditable: (participantId: number) => dispatch(activateEditable({ participantId })),
        cancelEditable: () => dispatch(cancelEditable()),
        changeEditable: (fieldCode: BxParticipantsDataKeys, value: string) => dispatch(changeEditable({ fieldCode, value })),

        updateParticipant,
        deleteParticipant,
        addParticipant
    }
}

