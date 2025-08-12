import { useParticipant } from '@/modules/entities';
import { useParticipantSeminar } from '@/modules/features';
import { useParticipantPpk } from '@/modules/features/participant-product/hook/useParticipantPpk';

export const useParticipantInfo = (participantId: number) => {
    const { loading: isPartisipantsLoading, participant } =
        useParticipant(participantId);
    const {
        participantToProducts,
        isLoading: isParticipantPpkLoading,
        isParticipantPpk,
        getParticipantProblems,
    } = useParticipantPpk();

    const {
        getParticipantProblems: getParticipantSeminarsProblems,
        participantToProducts: participantToSeminars,
        isLoading: isParticipantSeminarsLoading,
        isParticipantSeminar,
        getParticipantProblems: getParticipantsSeminarsProblems,
    } = useParticipantSeminar();

    const { hasProblems, participantPpkTopicsStats, problems } =
        getParticipantProblems(participantId);

    const {
        hasProblems: hasSeminarsProblems,
        participantPpkTopicsStats: seminarsPpkTopicsStats,
        problems: seminarsProblems,
    } = getParticipantSeminarsProblems(participantId);

    const programsThemes = participantPpkTopicsStats.map(stat => stat.topic);
    const assignedProducts = participantToProducts[participantId] ?? [];
    const isPpk = isParticipantPpk(participantId);

    const assignedSeminars = participantToSeminars[participantId] ?? [];

    return {
        isPartisipantsLoading,
        isParticipantPpkLoading,
        problems,
        hasProblems,
        participantPpkTopicsStats,
        participantToProducts,
        programsThemes,
        assignedProducts,
        isPpk,

        //seminars
        seminarsProblems,
        hasSeminarsProblems,
        seminarsPpkTopicsStats,
        isParticipantSeminarsLoading,
        isParticipantSeminar,
        participantToSeminars,
        getParticipantSeminarsProblems,
        assignedSeminars,
    };
};
