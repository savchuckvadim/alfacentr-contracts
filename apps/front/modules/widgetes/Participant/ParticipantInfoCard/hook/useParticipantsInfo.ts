import { useParticipantsList } from "@/modules/widgetes/shared/hooks";

export const useParticipantsInfo = () => {
    const listData = useParticipantsList();
    
    return {
        // Данные участников
        participants: listData.participants,
        
        // Состояние загрузки
        isPartisipantsLoading: listData.isPartisipantsLoading,
        isParticipantPpkLoading: listData.isParticipantPpkLoading,

        // Статистика
        participantsCount: listData.participantsCount,
        withPpkCount: listData.withPpkCount,
        withoutPpkCount: listData.withoutPpkCount,
        paricipantWithProblemCount: listData.paricipantWithProblemCount,
        
        // Данные распределения
        participantToProducts: listData.participantToProducts,
        
        // Проблемы
        participantsProblems: listData.participantsProblems,
        hasProblems: listData.hasProblems,
        
        // Форматтеры для обратной совместимости
        getParticipantName: listData.getParticipantName,
    };
};


