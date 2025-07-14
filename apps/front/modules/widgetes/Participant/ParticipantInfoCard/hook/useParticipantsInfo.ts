import { useParticipantData, useParticipantFormatters } from "@/modules/entities/participant/hooks";
import { useParticipantProductCalculations, useParticipantProductProblems } from "@/modules/features/participant-product/hooks";

export const useParticipantsInfo = () => {
    const { participants, loading: isPartisipantsLoading } = useParticipantData();
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
    const { participantsProblems, hasProblems } = problems.getParticipantsProblems(participants);

    // Создаем объект participantToProducts для обратной совместимости
    const participantToProducts: Record<number, any[]> = {};
    participants.forEach(participant => {
        participantToProducts[participant.id] = calculations.getAssignedProducts(participant.id);
    });

    // Состояние загрузки (пока упрощенно)
    const isParticipantPpkLoading = false; // TODO: добавить реальную логику загрузки


    // Количсество проблем всех участников
    let participantsProblemsCount = 0
    participantsProblems.forEach(participants => {
        for (const key in participants) {
            if (participants[key]) {
                if (participants[key].problems) {
                    participantsProblemsCount += participants[key].problems.length
                }
            }
        }
    })
    return {
        // Данные участников
        participants,

        // Состояние загрузки
        isPartisipantsLoading,
        isParticipantPpkLoading,

        // Статистика
        participantsCount,
        withPpkCount,
        withoutPpkCount,
        paricipantWithProblemCount,
        participantsProblemsCount,

        // Данные распределения
        participantToProducts,

        // Проблемы
        participantsProblems,
        hasProblems,

        // Форматтеры для обратной совместимости
        getParticipantName: formatters.getName,
    };
};


