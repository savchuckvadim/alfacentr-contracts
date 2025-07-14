import { useAppSelector } from "@/modules/app";

export const useParticipantProductDistribution = () => {
    const { ppkDistribution } = useAppSelector(state => state.participantProduct);
    
    return {
        topicStats: ppkDistribution.topicStats,
        participantToProducts: ppkDistribution.participantToProducts,
        productToParticipants: ppkDistribution.productToParticipants,
        unassignedParticipants: ppkDistribution.unassignedParticipants,
        participantsPpkTopicsStats: ppkDistribution.participantsPpkTopicsStats,
    };
}; 