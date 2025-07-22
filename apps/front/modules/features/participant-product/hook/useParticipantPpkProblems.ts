import { IParticipant } from '@alfa/entities';
import { useParticipantPpk } from './useParticipantPpk';

export const useParticipantPpkProblems = (participants: IParticipant[]) => {
    const { participantToProducts } = useParticipantPpk();

    return {
        participantsWithProblems: [],
        participantsWithoutProblems: [],
        participantsWithIssues: [],
    };
};
