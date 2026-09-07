import {
    AlfaParticipantSmartItemUserFieldsEnum,
    CategoryIdEnum,
    EntityTypeIdEnum,
    getNextPpkEventDate,
    parsePpkEvents,
    SmartStageEnum,
} from '@alfa/entities';
import { BitrixService } from '@/modules/bitrix';
import {
    addDaysToProjectDate,
    getProjectDate,
} from '@/lib/utils/project-time.util';

/** За сколько дней до начала участник считается подтвержденным */
export const PPK_CONFIRM_DAYS_BEFORE = 14;

/**
 * Стадии, из которых участника можно двигать автоматически.
 * «Пришел» и «Не пришел» — факт посещения, его отмечает человек
 */
const MOVABLE_STAGES: string[] = [
    SmartStageEnum.NEW,
    SmartStageEnum.PREPARATION,
    SmartStageEnum.CLIENT,
];

export interface PpkScheduleItemResult {
    participantId: number;
    nextEventDate: string;
    stageChanged: boolean;
}

export interface PpkScheduleResult {
    checked: number;
    dateUpdated: number;
    stageUpdated: number;
    errors: string[];
}

/** Наступил ли порог подтверждения: до начала осталось не больше N дней */
export const isConfirmThresholdReached = (
    nextEventDate: string,
    today: string,
    daysBefore: number = PPK_CONFIRM_DAYS_BEFORE,
): boolean => {
    if (!nextEventDate || nextEventDate < today) return false;

    return nextEventDate <= addDaysToProjectDate(today, daysBefore);
};

/**
 * Актуализация участников ППК по датам обучения.
 *
 * Считает ближайшую дату начала (витрина для фильтров CRM) и, когда до нее
 * остается не больше двух недель, переводит участника в «Подтвержден».
 */
export class PpkScheduleService {
    constructor(private readonly bitrix: BitrixService) {}

    async run(now: Date = new Date()): Promise<PpkScheduleResult> {
        //«сегодня» по Новосибирску: контейнер идет по UTC, и ночью
        //системная дата отстает на сутки от той, по которой живет заказчик
        const today = getProjectDate(now);
        const result: PpkScheduleResult = {
            checked: 0,
            dateUpdated: 0,
            stageUpdated: 0,
            errors: [],
        };

        const participants = await this.getParticipants();
        result.checked = participants.length;

        for (const participant of participants) {
            try {
                const changed = await this.processParticipant(
                    participant,
                    today,
                );
                if (changed?.dateChanged) result.dateUpdated++;
                if (changed?.stageChanged) result.stageUpdated++;
            } catch (error) {
                //сбой одного участника не должен прерывать прогон
                const reason =
                    error instanceof Error ? error.message : String(error);
                result.errors.push(
                    `участник ${String(participant.id)}: ${reason}`,
                );
            }
        }

        return result;
    }

    private async getParticipants(): Promise<Record<string, unknown>[]> {
        const items: Record<string, unknown>[] = [];

        //crm.item.list отдает по 50 записей — без постраничного обхода
        //крон обработал бы только первую страницу участников
        let start: number | undefined = 0;
        while (start !== undefined) {
            const response = await this.bitrix.item.list(
                EntityTypeIdEnum.PARTICIPANT.toString(),
                { categoryId: CategoryIdEnum.PARTICIPANT },
                [
                    'id',
                    'stageId',
                    AlfaParticipantSmartItemUserFieldsEnum.ufCrm12PpkEvents,
                    AlfaParticipantSmartItemUserFieldsEnum.ufCrm12NextEventDate,
                ],
                start,
            );

            const page = (response?.result?.items || []) as Record<
                string,
                unknown
            >[];
            items.push(...page);

            const next = (response as { next?: number })?.next;
            //страховка от бесконечного цикла, если битрикс вернет то же смещение
            start =
                typeof next === 'number' && next > start && page.length
                    ? next
                    : undefined;
        }

        //дальше работаем только с теми, у кого есть даты обучения
        return items.filter(
            item =>
                parsePpkEvents(
                    item[
                        AlfaParticipantSmartItemUserFieldsEnum.ufCrm12PpkEvents
                    ] as string,
                ).length > 0,
        );
    }

    private async processParticipant(
        item: Record<string, unknown>,
        today: string,
    ): Promise<{ dateChanged: boolean; stageChanged: boolean } | null> {
        const participantId = Number(item.id);
        if (!participantId) return null;

        const events = parsePpkEvents(
            item[
                AlfaParticipantSmartItemUserFieldsEnum.ufCrm12PpkEvents
            ] as string,
        );
        const nextEventDate = getNextPpkEventDate(events, today);

        const currentDate = this.normalizeDate(
            item[
                AlfaParticipantSmartItemUserFieldsEnum.ufCrm12NextEventDate
            ] as string,
        );
        const currentStage = (item.stageId as string) || '';

        const fields: Record<string, string> = {};

        if (currentDate !== nextEventDate) {
            fields[
                AlfaParticipantSmartItemUserFieldsEnum.ufCrm12NextEventDate
            ] = nextEventDate;
        }

        const needConfirm =
            isConfirmThresholdReached(nextEventDate, today) &&
            MOVABLE_STAGES.includes(currentStage) &&
            currentStage !== SmartStageEnum.DONE;

        if (needConfirm) fields.stageId = SmartStageEnum.DONE;

        if (!Object.keys(fields).length) {
            return { dateChanged: false, stageChanged: false };
        }

        await this.bitrix.item.update(
            participantId,
            EntityTypeIdEnum.PARTICIPANT.toString() as never,
            fields,
        );

        return {
            dateChanged:
                AlfaParticipantSmartItemUserFieldsEnum.ufCrm12NextEventDate in
                fields,
            stageChanged: 'stageId' in fields,
        };
    }

    /** Битрикс отдает дату с временем — сравниваем только календарную часть */
    private normalizeDate(value?: string): string {
        if (!value) return '';
        return String(value).slice(0, 10);
    }
}
