import { useParticipantData, useParticipantFormatters } from "@/modules/entities/participant/hooks";
import { useParticipantProductCalculations, useParticipantProductProblems } from "@/modules/features/participant-product/hooks";

export const useParticipantInfo = (participantId: number) => {
    const { participant, loading: isPartisipantsLoading } = useParticipantData(participantId);
    const formatters = useParticipantFormatters();
    const calculations = useParticipantProductCalculations();
    const problems = useParticipantProductProblems();

    // Получаем проблемы для участника
    const { hasProblems, problems: participantProblems } = problems.getParticipantProblems(participantId);
    const participantPpkTopicsStats = calculations.getParticipantPpkTopicsStats(participantId);
    const assignedProducts = calculations.getAssignedProducts(participantId);
    const isPpk = calculations.isParticipantPpk(participantId);

    // Форматируем темы программ
    const programsThemes = participantPpkTopicsStats.map(stat => stat.topic);

    // Состояние загрузки (пока упрощенно, можно добавить более детальную логику)
    const isParticipantPpkLoading = false; // TODO: добавить реальную логику загрузки

    // Создаем объект participantToProducts для обратной совместимости
    const participantToProducts = {
        [participantId]: assignedProducts
    };

    // Отладочная информация
    console.log(`Participant ${participantId}:`, {
        hasProblems,
        problemsCount: participantProblems.length,
        assignedProductsCount: assignedProducts.length,
        isPpk,
        programsThemesCount: programsThemes.length
    });

    return {
        // Состояние загрузки
        isPartisipantsLoading,
        isParticipantPpkLoading,
        
        // Проблемы
        problems: participantProblems,
        hasProblems,
        
        // Данные участника
        participantPpkTopicsStats,
        participantToProducts, // для обратной совместимости
        programsThemes,
        assignedProducts,
        isPpk,
        
        // Форматтеры для обратной совместимости
        getParticipantName: formatters.getName,
        getParticipantEmail: formatters.getEmail,
        getParticipantPhone: formatters.getPhone,
    };
};


