import { IParticipant, BxParticipantsDataKeys } from "@alfa/entities";
import { IAlfaProduct } from "@/modules/entities";

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export const useValidation = () => {
    return {
        validateParticipantData: (participant: IParticipant): ValidationResult => {
            const errors: string[] = [];
            const warnings: string[] = [];

            // Проверка обязательных полей
            const emailField = participant.fields?.find(f => f.code === BxParticipantsDataKeys.email);
            if (!emailField?.value) {
                errors.push('Email обязателен');
            }

            const phoneField = participant.fields?.find(f => f.code === BxParticipantsDataKeys.phone);
            if (!phoneField?.value) {
                warnings.push('Телефон не указан');
            }

            return {
                isValid: errors.length === 0,
                errors,
                warnings
            };
        },

        validateParticipantProductMatch: (participant: IParticipant, product: IAlfaProduct): ValidationResult => {
            const errors: string[] = [];
            const warnings: string[] = [];

            // Проверка соответствия типа продукта и участника
            const participantPrograms = participant.fields?.filter(f => 
                f.code.includes('PROGRAM') && f.value
            ) || [];

            if (participantPrograms.length === 0) {
                warnings.push('Участник не выбрал программы');
            }

            return {
                isValid: errors.length === 0,
                errors,
                warnings
            };
        },

        validatePpkRequirements: (participant: IParticipant, products: IAlfaProduct[]): ValidationResult => {
            const errors: string[] = [];
            const warnings: string[] = [];

            const ppkFields = participant.fields?.filter(f => 
                f.code.includes('PPK') && f.value
            ) || [];

            if (ppkFields.length > 0 && products.length === 0) {
                errors.push('Участник выбрал ППК программы, но не назначен на продукты');
            }

            return {
                isValid: errors.length === 0,
                errors,
                warnings
            };
        }
    };
}; 