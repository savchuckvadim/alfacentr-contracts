import { useParticipantData, useParticipantActions, useParticipantFormatters } from "../../hooks";

export const useParticipant = (id?: number) => {
    const { participant, participants, loading, editLoading, error, participantsCount } = useParticipantData(id);
    const actions = useParticipantActions();
    const formatters = useParticipantFormatters();

    // Форматированные данные для конкретного участника
    const name = participant ? formatters.getName(participant) : '';
    const email = participant ? formatters.getEmail(participant) : '';
    const phone = participant ? formatters.getPhone(participant) : '';
    const format = participant ? formatters.getFormat(participant) : '';
    const isPpk = participant ? formatters.getIsPpk(participant) : false;
    const programs = participant ? formatters.formatPrograms(participant) : '';

    return {
        // Данные
        participant,
        participants,
        loading,
        editLoading,
        error,
        participantsCount,
        
        // Форматированные данные
        name,
        email,
        phone,
        format,
        isPpk,
        programs,
        
        // Действия
        ...actions,
        
        // Форматтеры (для обратной совместимости)
        getParticipantName: formatters.getName,
        getParticipantEmail: formatters.getEmail,
        getParticipantPhone: formatters.getPhone,
        getParticipantFormat: formatters.getFormat,
        getParticipantIsPpk: formatters.getIsPpk,
        formatParticipantPrograms: formatters.formatPrograms,
    };
};

