import { useParticipantDisplay } from "@/modules/widgetes/shared/hooks";

export const useParticipantInfo = (participantId: number) => {
    const displayData = useParticipantDisplay(participantId);
    
    // Создаем объект participantToProducts для обратной совместимости
    const participantToProducts = {
        [participantId]: displayData.assignedProducts
    };

    return {
        // Состояние загрузки
        isPartisipantsLoading: displayData.loading,
        isParticipantPpkLoading: displayData.isParticipantPpkLoading,
        
        // Проблемы
        problems: displayData.problems,
        hasProblems: displayData.hasProblems,
        
        // Данные участника
        participantPpkTopicsStats: displayData.participantPpkTopicsStats,
        participantToProducts, // для обратной совместимости
        programsThemes: displayData.programsThemes,
        assignedProducts: displayData.assignedProducts,
        isPpk: displayData.isPpkParticipant,
        
        // Форматтеры для обратной совместимости
        getParticipantName: (participant: any) => participant?.name || '',
        getParticipantEmail: (participant: any) => participant?.email || '',
        getParticipantPhone: (participant: any) => participant?.phone || '',
    };
};


