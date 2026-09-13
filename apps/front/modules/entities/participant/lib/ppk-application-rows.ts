import {
    AlfaParticipantSmartItemUserFieldsEnum,
    IParticipant,
    mergePpkEventsWithTopics,
    parsePpkEvents,
} from '@alfa/entities';
import { getParticipantFieldValue } from '../ui/utils/participant.utils';

/** Строка приложения ППК: одна пара «участник — программа» */
export interface IPpkApplicationRow {
    participantId: number;
    topic: string;
    fio: string;
    email: string;
    phone: string;
    dateFrom: string;
    dateTo: string;
}

export type TPpkContactField = 'fio' | 'email' | 'phone';

export const PPK_CONTACT_BITRIX_ID: Record<
    TPpkContactField,
    AlfaParticipantSmartItemUserFieldsEnum
> = {
    fio: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name,
    email: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email,
    phone: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone,
};

/** Ровно та часть статистики по программе, которая нужна для сборки строк */
export interface IPpkTopicStatLike {
    topic: string;
    participants?: { id: number }[];
}

/**
 * Ровно та часть распределения ППК, которая нужна для сборки строк.
 * В сторе topicStats — массив; объект допускаем на случай, если форма
 * изменится, перебор через Object.values работает с обоими.
 */
export interface IPpkDistributionLike {
    topicStats?:
        | IPpkTopicStatLike[]
        | Record<string, IPpkTopicStatLike | undefined>;
}

/**
 * Значение поля участника бывает массивом строк, если поле в портале
 * множественное. Общий помощник сводит массив к строке, а не отдаёт его как
 * есть — иначе дальше .trim() падает и окно не открывается.
 */
const getFieldValue = (
    participant: IParticipant,
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum,
): string => getParticipantFieldValue(participant, bitrixId);

/**
 * Собирает строки приложения ППК: пары «участник — программа» с личными
 * датами обучения и контактами участника.
 *
 * Даты обучения у каждого участника свои — двое на одной программе могут
 * учиться в разные периоды, поэтому даты живут на паре «участник —
 * программа», а не у товара. Сохранённые даты мерджатся с текущим
 * распределением: программы, которых у участника больше нет, не удаляются
 * молча, а возвращаются в orphanedTopics.
 *
 * Чистая функция без состояния правок: и окно подтверждения, и таб
 * «Приложение ППК» строят строки одинаково, а поверх накладывают своё —
 * окно локальные правки до отправки, таб сохранение на лету.
 */
export const buildPpkApplicationRows = (
    participants: IParticipant[],
    ppkDistribution: IPpkDistributionLike,
): { rows: IPpkApplicationRow[]; orphanedTopics: string[] } => {
    //какие программы у какого участника — берём из готового распределения
    const topicsByParticipant = new Map<number, string[]>();
    for (const stat of Object.values(ppkDistribution.topicStats || {})) {
        if (!stat) continue;
        for (const participant of stat.participants || []) {
            const list = topicsByParticipant.get(participant.id) || [];
            list.push(stat.topic);
            topicsByParticipant.set(participant.id, list);
        }
    }

    const rows: IPpkApplicationRow[] = [];
    const orphaned = new Set<string>();

    for (const participant of participants) {
        const topics = topicsByParticipant.get(participant.id) || [];
        if (!topics.length) continue;

        const saved = parsePpkEvents(
            getFieldValue(
                participant,
                AlfaParticipantSmartItemUserFieldsEnum.ufCrm12PpkEvents,
            ),
        );
        const merged = mergePpkEventsWithTopics(saved, topics);
        for (const orphan of merged.orphanedEvents) {
            orphaned.add(orphan.topic);
        }

        for (const event of merged.events) {
            rows.push({
                participantId: participant.id,
                topic: event.topic,
                fio: getFieldValue(participant, PPK_CONTACT_BITRIX_ID.fio),
                email: getFieldValue(participant, PPK_CONTACT_BITRIX_ID.email),
                phone: getFieldValue(participant, PPK_CONTACT_BITRIX_ID.phone),
                dateFrom: event.dateFrom,
                dateTo: event.dateTo,
            });
        }
    }

    return { rows, orphanedTopics: [...orphaned] };
};
