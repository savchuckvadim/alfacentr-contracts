import { useParticipantProductDistribution } from "./useParticipantProductDistribution";

export const useParticipantProductCalculations = () => {
    const distribution = useParticipantProductDistribution();
    
    return {
        isProductPpk: (productId: number) => {
            return !!distribution.productToParticipants[productId];
        },

        isParticipantPpk: (participantId: number) => {
            const stats = distribution.participantsPpkTopicsStats[participantId];
            return stats && stats.length > 0;
        },

        getParticipantPpkTopicsStats: (participantId: number) => {
            return distribution.participantsPpkTopicsStats[participantId] || [];
        },

        getAssignedProducts: (participantId: number) => {
            return distribution.participantToProducts[participantId] || [];
        },

        getAssignedParticipants: (productId: number) => {
            return distribution.productToParticipants[productId] || [];
        },

        getUnassignedParticipantsCount: () => {
            return distribution.unassignedParticipants.length;
        },

        getTopicsCount: () => {
            return distribution.topicStats.length;
        },

        getTopicsWithDeficit: () => {
            return distribution.topicStats.filter(stat => stat.diff < 0);
        },

        getTopicsWithSurplus: () => {
            return distribution.topicStats.filter(stat => stat.diff > 0);
        },

        getBalancedTopics: () => {
            return distribution.topicStats.filter(stat => stat.diff === 0);
        }
    };
}; 