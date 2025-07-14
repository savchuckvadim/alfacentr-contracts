'use client'
import { useParticipant } from "@/modules/entities";
import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts";
import { useEffect, useState } from "react";
import { useParticipantProductDistribution } from "../hooks/useParticipantProductDistribution";
import { useParticipantProductCalculations } from "../hooks/useParticipantProductCalculations";
import { useParticipantProductProblems } from "../hooks/useParticipantProductProblems";

export const useParticipantPpk = () => {
    const { loading: isParticipantLoading } = useParticipant();
    const { loading: isProductsLoading } = useAlfaProducts();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(isParticipantLoading || isProductsLoading);
    }, [isParticipantLoading, isProductsLoading]);

    const distribution = useParticipantProductDistribution();
    const calculations = useParticipantProductCalculations();
    const problems = useParticipantProductProblems();

    return {
        // Состояние загрузки
        isLoading,
        
        // Данные распределения
        ...distribution,
        
        // Вычисления
        isProductPpk: calculations.isProductPpk,
        isParticipantPpk: calculations.isParticipantPpk,
        getParticipantPpkTopicsStats: calculations.getParticipantPpkTopicsStats,
        getAssignedProducts: calculations.getAssignedProducts,
        getAssignedParticipants: calculations.getAssignedParticipants,
        getUnassignedParticipantsCount: calculations.getUnassignedParticipantsCount,
        getTopicsCount: calculations.getTopicsCount,
        getTopicsWithDeficit: calculations.getTopicsWithDeficit,
        getTopicsWithSurplus: calculations.getTopicsWithSurplus,
        getBalancedTopics: calculations.getBalancedTopics,
        
        // Проблемы
        getParticipantProblems: problems.getParticipantProblems,
        getParticipantsProblems: problems.getParticipantsProblems,
        getGlobalProblems: problems.getGlobalProblems,
    };
};





