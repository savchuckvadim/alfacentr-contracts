import { getParticipantName, useParticipant } from '@/modules/entities';
import { useParticipantSeminar } from '@/modules/features/participant-product/hook/useParticipantSeminar';

export const useParticipantsSeminarInfo = () => {
    const { loading: isPartisipantsLoading, participants } = useParticipant();

    const participantsIds = participants.map(participant => participant.id);
    const {
        topicStats,
        participantToProducts,
        isLoading: isParticipantPpkLoading,
        isParticipantSeminar,
        getParticipantProblems,
        getParticipantsProblems,
    } = useParticipantSeminar();

    const participantsCount = participants.length;
    const paricipantWithProblemCount = participantsIds.filter(
        id => getParticipantProblems(id).hasProblems,
    ).length;
    const withPpkCount = participantsIds.filter(id =>
        isParticipantSeminar(id),
    ).length;
    const withoutPpkCount = participantsCount - withPpkCount;

    const { participantsProblems, hasProblems, problemsCount } =
        getParticipantsProblems(participants);

    return {
        participants,

        isPartisipantsLoading,
        isParticipantPpkLoading,

        participantsCount,
        withPpkCount,
        withoutPpkCount,
        paricipantWithProblemCount,
        participantToProducts,
        participantsProblems,
        hasProblems,
        problemsCount,
    };
};
