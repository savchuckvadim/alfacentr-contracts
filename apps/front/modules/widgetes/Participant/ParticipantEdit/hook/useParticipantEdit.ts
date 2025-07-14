import { useParticipantEdit as useSharedParticipantEdit } from "@/modules/widgetes/shared/hooks";

export const useEditParticipant = (participantId: number) => {
    return useSharedParticipantEdit(participantId);
};