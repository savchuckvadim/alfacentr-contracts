import { getParticipantName, useParticipant } from '@/modules/entities';
import { useParticipantPpk } from '@/modules/features/participant-product/hook/useParticipantPpk';

export const useParticipantsInfo = () => {
    const { loading: isPartisipantsLoading, participants } = useParticipant();

    const participantsIds = participants.map(participant => participant.id);
    const {
        topicStats,
        participantToProducts,
        isLoading: isParticipantPpkLoading,
        isParticipantPpk,
        getParticipantProblems,
        getParticipantsProblems,
    } = useParticipantPpk();

    const participantsCount = participants.length;
    const paricipantWithProblemCount = participantsIds.filter(
        id => getParticipantProblems(id).hasProblems,
    ).length;
    const withPpkCount = participantsIds.filter(id =>
        isParticipantPpk(id),
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
