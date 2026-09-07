import { BitrixService, IBXDeal } from '@/modules/bitrix';
import { BitrixOwnerType } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import {
    CategoryIdEnum,
    DEAL_INIT_PROCESSED_AT_BITRIX_ID,
    EntityTypeIdEnum,
} from '@alfa/entities';
import {
    getRecoveryWindow,
    isRecoveryCandidate,
    RECOVERY_BATCH_LIMIT,
    RecoveryCandidate,
    SEMINAR_DEAL_CATEGORY_ID,
    SEMINAR_DEAL_NEW_STAGE_ID,
} from './deal-init-recovery.rules';

export interface DealInitRecoveryResult {
    candidates: number;
    processed: number;
    processedIds: number[];
    markedOnly: number;
    errors: string[];
}

/**
 * Подхват заявок, которые не дошли до сервера.
 *
 * Прием заявки не идемпотентен: товары ставятся заменой всего состава,
 * участники только добавляются. Поэтому перед прогоном сделка точечно
 * проверяется на пустоту, а не только по признаку — непустые лишь помечаются
 */
export class DealInitRecoveryService {
    constructor(
        private readonly bitrix: BitrixService,
        private readonly processDeal: (dealId: number) => Promise<unknown>,
    ) {}

    async run(now: Date = new Date()): Promise<DealInitRecoveryResult> {
        const result: DealInitRecoveryResult = {
            candidates: 0,
            processed: 0,
            processedIds: [],
            markedOnly: 0,
            errors: [],
        };

        const candidates = (await this.findCandidates(now)).slice(
            0,
            RECOVERY_BATCH_LIMIT,
        );
        result.candidates = candidates.length;

        for (const deal of candidates) {
            try {
                if (await this.isDealEmpty(deal.id)) {
                    await this.processDeal(deal.id);
                    result.processed++;
                    result.processedIds.push(deal.id);
                } else {
                    //товары или участники уже есть — повторный прием сотрет
                    //ручные правки и задвоит участников, только помечаем
                    await this.markProcessed(deal.id);
                    result.markedOnly++;
                }
            } catch (error) {
                const reason =
                    error instanceof Error ? error.message : String(error);
                result.errors.push(`сделка ${deal.id}: ${reason}`);
            }
        }

        return result;
    }

    /**
     * Одной страницы (50) достаточно: за прогон берем не больше
     * RECOVERY_BATCH_LIMIT, а обработанные помечаются и в выборку не вернутся
     */
    private async findCandidates(now: Date): Promise<RecoveryCandidate[]> {
        const { from, to } = getRecoveryWindow(now);

        const response = await this.bitrix.deal.getList(
            {
                CATEGORY_ID: String(SEMINAR_DEAL_CATEGORY_ID),
                STAGE_ID: SEMINAR_DEAL_NEW_STAGE_ID,
                [DEAL_INIT_PROCESSED_AT_BITRIX_ID]: false,
                '>=DATE_CREATE': from.toISOString(),
                '<=DATE_CREATE': to.toISOString(),
            },
            [
                'ID',
                'STAGE_ID',
                'CATEGORY_ID',
                'DATE_CREATE',
                DEAL_INIT_PROCESSED_AT_BITRIX_ID,
            ],
            { ID: 'ASC' },
        );

        const rows: IBXDeal[] = response?.result || [];

        return rows
            .map((row) => ({
                id: Number(row.ID),
                stageId: row.STAGE_ID || '',
                categoryId: row.CATEGORY_ID,
                dateCreate: this.asString(row.DATE_CREATE),
                processedAt: this.asString(
                    row[DEAL_INIT_PROCESSED_AT_BITRIX_ID],
                ),
            }))
            //критерии дублируем локально: так они соблюдаются, даже если
            //фильтр портала по дате или пустому полю отработал неточно
            .filter((deal) => isRecoveryCandidate(deal, now));
    }

    private async isDealEmpty(dealId: number): Promise<boolean> {
        const rows = await this.bitrix.productRow.list({
            '=ownerType': BitrixOwnerType.DEAL,
            '=ownerId': dealId,
        });
        if ((rows?.result?.productRows || []).length > 0) return false;

        const participants = await this.bitrix.item.list(
            EntityTypeIdEnum.PARTICIPANT.toString(),
            {
                categoryId: CategoryIdEnum.PARTICIPANT,
                parentId2: dealId,
            } as never,
            ['id'],
        );

        return (participants?.result?.items || []).length === 0;
    }

    private async markProcessed(dealId: number): Promise<void> {
        await this.bitrix.deal.update(dealId, {
            [DEAL_INIT_PROCESSED_AT_BITRIX_ID]: new Date().toISOString(),
        });
    }

    /** Значения полей сделки приходят разнотипными — приводим к строке */
    private asString(value: IBXDeal[string]): string {
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        return '';
    }
}
