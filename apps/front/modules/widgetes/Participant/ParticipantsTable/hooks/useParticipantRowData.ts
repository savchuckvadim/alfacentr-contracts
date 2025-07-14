import { useParticipantData, useParticipantFormatters } from "@/modules/entities/participant/hooks";
import { useParticipantProductCalculations } from "@/modules/features/participant-product/hooks";

export const useParticipantRowData = (participantId: number) => {
    const { participant } = useParticipantData(participantId);
    const formatters = useParticipantFormatters();
    const calculations = useParticipantProductCalculations();

    if (!participant) {
        return {
            name: '',
            email: '',
            phone: '',
            format: '',
            isPpk: false,
            programs: '',
            participantPpkTopicsStats: [],
            assignedProducts: [],
        };
    }

    // Форматированные данные
    const name = formatters.getName(participant);
    const email = formatters.getEmail(participant);
    const phone = formatters.getPhone(participant);
    const format = formatters.getFormat(participant);
    const isPpk = formatters.getIsPpk(participant);
    const programs = formatters.formatPrograms(participant);

    // Данные ППК
    const participantPpkTopicsStats = calculations.getParticipantPpkTopicsStats(participantId);
    const assignedProducts = calculations.getAssignedProducts(participantId);

    return {
        name,
        email,
        phone,
        format,
        isPpk,
        programs,
        participantPpkTopicsStats,
        assignedProducts,
    };
}; 