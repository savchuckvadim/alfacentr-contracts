import { getParticipantIsPpk, useParticipant } from '@/modules/entities';
import { useParticipantPpk } from '@/modules/features/participant-product/hook/useParticipantPpk';
import { useEffect } from 'react';

export const useParticipantInfo = (participantId: number) => {
    const { loading: isPartisipantsLoading, participant } =
        useParticipant(participantId);
    const {
        participantToProducts,
        isLoading: isParticipantPpkLoading,
        isParticipantPpk,
        getParticipantProblems,
    } = useParticipantPpk();
    const { hasProblems, participantPpkTopicsStats, problems } =
        getParticipantProblems(participantId);
    const programsThemes = participantPpkTopicsStats.map(stat => stat.topic);
    const assignedProducts = participantToProducts[participantId] ?? [];
    const isPpk = isParticipantPpk(participantId);

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
    };
};
