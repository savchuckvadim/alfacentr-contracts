import { Bank } from '@/apps/rq/types/bx-bank.type';

/**
 * Утилиты для работы с банками
 */

/**
 * Фильтрует поля банка, убирая пустые значения
 */
export const filterBankFields = (bank: Bank): Record<string, any> => {
    const fields: Record<string, any> = {};
    for (const [key, value] of Object.entries(bank)) {
        if (value !== null && value !== undefined && value !== '') {
            fields[key] = value;
        }
    }
    return fields;
};

/**
 * Проверяет, есть ли банк с ID
 */
export const hasBankWithId = (banks: Bank[] | null | undefined): boolean => {
    if (!banks) return false;
    return banks.some((b) => b.ID);
};

/**
 * Создает пустой банк
 */
export const createEmptyBank = (): Bank => {
    return new Bank({ ID: -1, ENTITY_ID: 4 });
};

/**
 * Добавляет пустой банк, если его нет
 */
export const addMissingBank = (requisite: any): void => {
    try {
        if (!hasBankWithId(requisite.bank)) {
            requisite.bank = requisite.bank || [];
            requisite.bank.push(createEmptyBank());
        }
    } catch {
        requisite.bank = [];
        requisite.bank.push(createEmptyBank());
    }
};

/**
 * Подготавливает банк для создания/обновления
 */
export const prepareBankForSave = (bank: Bank): Bank => {
    if (bank.ID === -1 || bank.ID === null || bank.ID === undefined) {
        bank.ID = null;
        bank.NAME = bank.RQ_BANK_NAME;
    }
    return bank;
};
