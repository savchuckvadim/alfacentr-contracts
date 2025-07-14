import { useParticipantDisplay } from "@/modules/widgetes/shared/hooks";

export const useParticipantRowData = (participantId: number) => {
    const displayData = useParticipantDisplay(participantId);

    return {
        name: displayData.name,
        email: displayData.email,
        phone: displayData.phone,
        format: displayData.format,
        isPpk: displayData.isPpk,
        programs: displayData.programs,
        participantPpkTopicsStats: displayData.participantPpkTopicsStats,
        assignedProducts: displayData.assignedProducts,
    };
}; 