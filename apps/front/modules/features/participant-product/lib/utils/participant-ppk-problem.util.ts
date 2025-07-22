import { IParticipantPpkTopicsStats } from '../../type/participant-ppk.type';

export const getParticipantPpkProblems = (
    participantsPpkTopicsStats: IParticipantPpkTopicsStats,
    participantId: number,
) => {
    const participantPpkTopicsStats =
        participantsPpkTopicsStats[participantId] ?? [];
    const hasProblems =
        participantPpkTopicsStats.some(
            stat =>
                stat.status === 'missing_ppk' ||
                stat.status === 'missing_ppk_quantity',
        ) ?? false;
    const problems = participantPpkTopicsStats.filter(
        stat =>
            stat.status === 'missing_ppk' ||
            stat.status === 'missing_ppk_quantity',
    );

    return {
        hasProblems,
        participantPpkTopicsStats: participantPpkTopicsStats ?? [],
        problems,
    };
};
