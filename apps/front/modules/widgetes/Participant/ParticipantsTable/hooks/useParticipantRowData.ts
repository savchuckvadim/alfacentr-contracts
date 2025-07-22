import { useEditParticipant } from '../../ParticipantEdit/hook/useParticipantEdit';
import { useParticipantInfo } from '../../ParticipantInfoCard/hook/useParticipantInfo';

export const useParticipantRowData = (participantId: number) => {
    const { name, email, phone, format, isPpk, programs } =
        useEditParticipant(participantId);

    const { participantPpkTopicsStats } = useParticipantInfo(participantId);
    const { assignedProducts } = useParticipantInfo(participantId);

    return {
        name,
        email,
        phone,
        format,
        isPpk,
        programs,
        participantPpkTopicsStats,
        assignedProducts,
    };
};
