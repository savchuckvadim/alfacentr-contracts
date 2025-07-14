import { useParticipantData, useParticipantFormatters } from "@/modules/entities/participant/hooks";
import { useParticipantProductCalculations, useParticipantProductProblems } from "@/modules/features/participant-product/hooks";
import { IParicipantPpkThemesStats } from "@/modules/features/participant-product/type/participant-ppk.type";

export interface ParticipantDisplayData {
    // Основные данные
    participant: any;
    loading: boolean;
    editLoading: boolean;
    error: string | null;
    
    // Форматированные данные
    name: string;
    email: string;
    phone: string;
    format: string;
    isPpk: boolean;
    programs: string;
    
    // ППК данные
    participantPpkTopicsStats: any[];
    assignedProducts: any[];
    programsThemes: string[];
    isPpkParticipant: boolean;
    
    // Проблемы
    problems: any[];
    hasProblems: boolean;
    
    // Состояние загрузки ППК
    isParticipantPpkLoading: boolean;
}

export const useParticipantDisplay = (participantId: number): ParticipantDisplayData => {
    const { participant, loading, editLoading, error } = useParticipantData(participantId);
    const formatters = useParticipantFormatters();
    const calculations = useParticipantProductCalculations();
    const problems = useParticipantProductProblems();

    // Получаем проблемы для участника
    const { hasProblems, problems: participantProblems } = problems.getParticipantProblems(participantId);
    const participantPpkTopicsStats = calculations.getParticipantPpkTopicsStats(participantId);
    const assignedProducts = calculations.getAssignedProducts(participantId);
    const isPpkParticipant = calculations.isParticipantPpk(participantId) || false;

    // Форматируем темы программ
    const programsThemes = participantPpkTopicsStats.map((stat: IParicipantPpkThemesStats) => stat.topic);

    // Состояние загрузки (пока упрощенно)
    const isParticipantPpkLoading = false; // TODO: добавить реальную логику загрузки

    // Форматированные данные
    const name = participant ? formatters.getName(participant) : '';
    const email = participant ? formatters.getEmail(participant) : '';
    const phone = participant ? formatters.getPhone(participant) : '';
    const format = participant ? formatters.getFormat(participant) : '';
    const isPpk = participant ? formatters.getIsPpk(participant) : false;
    const programs = participant ? formatters.formatPrograms(participant) : '';

    return {
        // Основные данные
        participant,
        loading,
        editLoading,
        error,
        
        // Форматированные данные
        name,
        email,
        phone,
        format,
        isPpk,
        programs,
        
        // ППК данные
        participantPpkTopicsStats,
        assignedProducts,
        programsThemes,
        isPpkParticipant,
        
        // Проблемы
        problems: participantProblems,
        hasProblems,
        
        // Состояние загрузки ППК
        isParticipantPpkLoading,
    };
}; 