import { useParticipantData, useParticipantFormatters } from "@/modules/entities/participant/hooks";
import { useParticipantProductCalculations, useParticipantProductProblems } from "@/modules/features/participant-product/hooks";

export interface ParticipantsListData {
    // Основные данные
    participants: any[];
    loading: boolean;
    error: string | null;
    participantsCount: number;
    
    // Статистика
    withPpkCount: number;
    withoutPpkCount: number;
    paricipantWithProblemCount: number;
    
    // Проблемы
    participantsProblems: any[];
    hasProblems: boolean;
    participantsProblemsCount: number;
    // Данные распределения
    participantToProducts: Record<number, any[]>;
    
    // Состояние загрузки
    isPartisipantsLoading: boolean;
    isParticipantPpkLoading: boolean;
    
    // Форматтеры
    getParticipantName: (participant: any) => string;
}

export const useParticipantsList = (): ParticipantsListData => {
    const { participants, loading: isPartisipantsLoading, error } = useParticipantData();
    const formatters = useParticipantFormatters();
    const calculations = useParticipantProductCalculations();
    const problems = useParticipantProductProblems();

    const participantsIds = participants.map(participant => participant.id);
    
    // Вычисляем статистику
    const participantsCount = participants.length;
    const paricipantWithProblemCount = participantsIds.filter(id => 
        problems.getParticipantProblems(id).hasProblems
    ).length;
    const withPpkCount = participantsIds.filter(id => 
        calculations.isParticipantPpk(id)
    ).length;
    const withoutPpkCount = participantsCount - withPpkCount;
   
    // Получаем проблемы для всех участников
    const { participantsProblems, hasProblems, problemsCount } = problems.getParticipantsProblems(participants);

    // Создаем объект participantToProducts для обратной совместимости
    const participantToProducts: Record<number, any[]> = {};
    participants.forEach(participant => {
        participantToProducts[participant.id] = calculations.getAssignedProducts(participant.id);
    });

    // Состояние загрузки (пока упрощенно)
    const isParticipantPpkLoading = false; // TODO: добавить реальную логику загрузки

    return {
        // Основные данные
        participants,
        loading: isPartisipantsLoading,
        error,
        participantsCount,
        
        // Статистика
        withPpkCount,
        withoutPpkCount,
        paricipantWithProblemCount,
        
        // Проблемы
        participantsProblems,
        hasProblems,
        participantsProblemsCount: problemsCount,
        // Данные распределения
        participantToProducts,
        
        // Состояние загрузки
        isPartisipantsLoading,
        isParticipantPpkLoading,
        
        // Форматтеры
        getParticipantName: formatters.getName,
    };
}; 