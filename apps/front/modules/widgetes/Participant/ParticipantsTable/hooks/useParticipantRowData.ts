import { useEditParticipant } from '../../ParticipantEdit/hook/useParticipantEdit';
import { useParticipantInfo } from '../../ParticipantInfoCard/hook/useParticipantInfo';
import { useParticipantSeminar } from '@/modules/features';

export const useParticipantRowData = (participantId: number) => {
    const { name, email, phone, format, isPpk, programs, days } =
        useEditParticipant(participantId);

    const {
        participantPpkTopicsStats,
        seminarsPpkTopicsStats,
        assignedSeminars,
    } = useParticipantInfo(participantId);
    const { assignedProducts } = useParticipantInfo(participantId);

    return {
        name,
        email,
        phone,
        format,
        isPpk,
        programs,
        days,
        participantPpkTopicsStats,
        seminarsPpkTopicsStats,
        assignedProducts,
        assignedSeminars,
    };
};
