import { useAppDispatch } from "@/modules/app/lib/hooks/redux";
import { AlfaParticipantSmartItemUserFieldsEnum, IParticipantField, BxParticipantsDataKeys } from "@alfa/entities";
import { 
    addParticipant as addBxParticipant, 
    updateParticipant as updateBxParticipant,
    deleteParticipant as deleteBxParticipant 
} from "../model/ParticipantThunk";
import { 
    activateEditable, 
    cancelEditable, 
    changeEditable 
} from "../model/PerticipantSlice";

export const useParticipantActions = () => {
    const dispatch = useAppDispatch();

    return {
        updateParticipant: () => {
            dispatch(updateBxParticipant());
        },

        deleteParticipant: (participantId: number) => {
            dispatch(deleteBxParticipant(participantId));
        },

        addParticipant: (fields: Partial<IParticipantField<AlfaParticipantSmartItemUserFieldsEnum>>) => {
            dispatch(addBxParticipant(fields));
        },

        activateEditable: (participantId: number) => 
            dispatch(activateEditable({ participantId })),

        cancelEditable: () => 
            dispatch(cancelEditable()),

        changeEditable: (fieldCode: BxParticipantsDataKeys, value: string) => 
            dispatch(changeEditable({ fieldCode, value }))
    };
}; 