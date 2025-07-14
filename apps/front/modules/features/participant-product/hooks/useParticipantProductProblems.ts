import { IParticipant } from "@alfa/entities";
import { useParticipantProductDistribution } from "./useParticipantProductDistribution";
import { getParticipantPpkProblems } from "../lib/utils/participant-ppk-problem.util";

export const useParticipantProductProblems = () => {
    const distribution = useParticipantProductDistribution();
    
    return {
        getParticipantProblems: (participantId: number) => {
            return getParticipantPpkProblems(distribution.participantsPpkTopicsStats, participantId);
        },

        getParticipantsProblems: (participants: IParticipant[]) => {
            const participantsProblems = participants.map(participant => {
                const { problems } = getParticipantPpkProblems(distribution.participantsPpkTopicsStats, participant.id);
                return {
                    [participant.id]: {
                        name: participant.fields?.find(f => f.code === 'name')?.value || 'Неизвестный участник',
                        problems
                    }
                };
            });

            let hasProblems = false;
            participantsProblems.forEach(problem => {
                for (const key in problem) {
                    const typeKey = Number(key) as number;
                    if (problem[typeKey]?.problems && problem[typeKey]?.problems.length > 0) {
                        hasProblems = true;
                    }
                }
            });

            return {
                participantsProblems,
                hasProblems
            };
        },

        getGlobalProblems: () => {
            const unassignedCount = distribution.unassignedParticipants.length;
            const topicsWithDeficit = distribution.topicStats.filter(stat => stat.diff < 0).length;
            
            const problems = [];
            
            if (unassignedCount > 0) {
                problems.push(`${unassignedCount} участников не назначены на ППК программы`);
            }
            
            if (topicsWithDeficit > 0) {
                problems.push(`${topicsWithDeficit} тем ППК имеют недостаток мест`);
            }
            
            return {
                problems,
                hasProblems: problems.length > 0,
                unassignedCount,
                topicsWithDeficit
            };
        }
    };
}; 