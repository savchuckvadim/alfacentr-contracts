/**
 * Типы для компонентов Summary панели
 */

export interface SummaryStatisticsProps {
    totalProductsCount: number;
    participantsCount: number;
    totalSum: number;
    isUp: boolean;
}

export interface SummaryStatusInfoProps {
    title: string;
    description: string;
}

export interface SummarySubmitButtonProps {
    isLoading: boolean;
    isDisabled: boolean;
    onSubmit: () => void;
    loadingText?: string;
    defaultText?: string;
}
