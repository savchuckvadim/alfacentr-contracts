import { IAlfaProduct } from '@/modules/entities';
import {
    AlfaParticipantSmartItemUserFieldsEnum,
    BxParticipantsDataKeys,
    IParticipant,
    IParticipantField,
} from '@alfa/entities';

export const ParticipantPpkFieldCodes: BxParticipantsDataKeys[] = [
    BxParticipantsDataKeys.accountant_gos,
    BxParticipantsDataKeys.accountant_medical,
    BxParticipantsDataKeys.zakupki,
    BxParticipantsDataKeys.kadry,
    BxParticipantsDataKeys.corruption,
];

export const ParticipantSeminarFieldCodes: BxParticipantsDataKeys[] = [
    BxParticipantsDataKeys.days,
];
export interface IParticipantPpkTopicsStats {
    [participantId: number]: IParicipantPpkThemesStats[];
}
export interface IParticipantPpkMap {
    participantsPpkTopicsStats: IParticipantPpkTopicsStats;
    participantToProducts: Map<number, IAlfaProduct[]>; // участник ID → назначенные продукты
    productToParticipants: Map<number, IParticipant[]>; // продукт ID → назначенные участники
    topicStats: ITopicStat[]; // статистика по темам
    unassignedParticipants: IParticipant[];
}
export interface IParticipantPpk {
    participantsPpkTopicsStats: IParticipantPpkTopicsStats;
    participantToProducts: Record<string, IAlfaProduct[]>;
    productToParticipants: Record<string, IParticipant[]>;
    topicStats: ITopicStat[];
    unassignedParticipants: IParticipant[];
}
export interface ITopicStat {
    topic: string;
    needed: number;
    available: number;
    diff: number;
    products: IAlfaProduct[];
    participants: IParticipant[];
}

export type ParticipantPpkField =
    | AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantGos
    | AlfaParticipantSmartItemUserFieldsEnum.ufCrm12AccountantMedical
    | AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Zakupki
    | AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Kadry
    | AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Corruption;

export interface IParicipantPpkThemesStats {
    participantField?: ParticipantPpkField;
    topic: string;
    participantId: number;
    status: 'ok' | 'missing_ppk' | 'missing_ppk_quantity';
    message: string | '';
    product: IAlfaProduct | null; // for ok
    potintialProduct: IAlfaProduct | null; // for missing_ppk_quantity
}
