import { useAppSelector } from "@/modules/app/";
import { useParticipantData, useParticipantActions, useParticipantFormatters } from "@/modules/entities/participant/hooks";
import { useParticipantProductProblems } from "@/modules/features/participant-product/hooks";
import { BxParticipantsDataKeys } from "@alfa/entities";

export const useEditParticipant = (participantId: number) => {
    const { participant, loading, editLoading } = useParticipantData(participantId);
    const actions = useParticipantActions();
    const formatters = useParticipantFormatters();
    const problems = useParticipantProductProblems();

    // Получаем проблемы для участника
    const { problems: participantProblems } = problems.getParticipantProblems(participantId);

    // Форматированные данные
    const name = participant ? formatters.getName(participant) : '';
    const email = participant ? formatters.getEmail(participant) : '';
    const phone = participant ? formatters.getPhone(participant) : '';
    const format = participant ? formatters.getFormat(participant) : '';
    const isPpk = participant ? formatters.getIsPpk(participant) : false;
    const programs = participant ? formatters.formatPrograms(participant) : '';

    // Состояние редактирования
    const editable = useAppSelector(state => state.participant.editable);

    const editParticipantTopic = (fieldCode: BxParticipantsDataKeys, value: string) => {
        actions.changeEditable(fieldCode, value);
    };

    return {
        // Состояние
        editable,
        loading,
        editLoading,
        
        // Проблемы
        problems: participantProblems,
        
        // Форматированные данные
        name,
        email,
        phone,
        format,
        isPpk,
        programs,
        
        // Действия
        activateEditable: actions.activateEditable,
        cancelEditable: actions.cancelEditable,
        changeEditable: actions.changeEditable,
        deleteParticipant: actions.deleteParticipant,
        updateParticipant: actions.updateParticipant,
        editParticipantTopic,
        
        // Форматтеры для обратной совместимости
        formatParticipantPrograms: formatters.formatPrograms,
    };
};