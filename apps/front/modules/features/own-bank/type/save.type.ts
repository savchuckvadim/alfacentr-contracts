import { ALFA_RQ_DATA } from "@alfa/entities";

export const STORAGE_KEY = 'own-bank-current-code';
export type TOwnBanksData = typeof ALFA_RQ_DATA
export type TOwnBankValue = typeof ALFA_RQ_DATA[keyof typeof ALFA_RQ_DATA]
