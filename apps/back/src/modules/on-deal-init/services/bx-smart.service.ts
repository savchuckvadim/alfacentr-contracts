import { Logger } from '@nestjs/common';
import { BitrixService } from 'src/modules/bitrix';
import { DealValue } from '../../../lib/deal-helper/deal-values-helper.service';
import {
    CategoryIdEnum,
    EntityTypeIdEnum,
    IAlfaParticipantSmartItem,
} from '@alfa/entities';
import { getParticipantValuesFromDeal } from '../../../lib/deal-helper/get-participant-product-values-from-deal.helepr';
import {
    FINGERPRINT_FIELDS,
    splitParticipantsToCreate,
} from './participant-fingerprint.rules';

export interface SetParticipantsResult {
    /** Кого завели этим приемом */
    created: IAlfaParticipantSmartItem[];
    /** Сколько участников заявки уже были в сделке — повторный прием */
    skipped: number;
}

export class BxSmartService {
    private readonly logger = new Logger(BxSmartService.name);
    private bitrix: BitrixService;
    // private smart: IAlfaParticipantSmartItem;
    private entityTypeId: EntityTypeIdEnum = EntityTypeIdEnum.PARTICIPANT;
    constructor() {}

    async init(bitrix: BitrixService) {
        this.bitrix = bitrix;
    }

    /**
     * Заводит участников заявки, пропуская тех, кто в сделке уже есть.
     *
     * Прием одной и той же заявки случается регулярно: вебхук портала
     * доходит с задержкой в минуты (сделка 204296, 17.11.2026: форма в
     * 16:21, вебхук на сервере в 16:28), за это время сделку успевает
     * забрать подстраховочный крон — и участник создавался дважды.
     * Плюс заявку пинают руками из сценария или переводом стадии.
     *
     * Сравнение идет по отпечатку всех полей участника, см.
     * participant-fingerprint.rules. Возвращает заведенных и число
     * пропущенных: прием пишет это в таймлайн сделки, иначе смарты
     * создаются молча и при разборе обращений не видно, кого завела заявка
     */
    public async setParticipantsSmarts(
        dealValues: DealValue[],
        dealId: number,
    ): Promise<SetParticipantsResult> {
        const fromBid = getParticipantValuesFromDeal(dealValues, dealId).map(
            (participant) =>
                ({
                    ...participant,
                    ufCrm12DealId: dealId.toString(),
                }) as IAlfaParticipantSmartItem,
        );

        const existing = await this.getDealParticipants(dealId);
        const { toCreate, skipped } = splitParticipantsToCreate(
            fromBid,
            existing,
        );

        const created: IAlfaParticipantSmartItem[] = [];
        for (const item of toCreate) {
            await this.add(this.entityTypeId, item);
            created.push(item);
        }

        //по этой строке видно, что отпечаток работает: при повторном приёме
        //заводим 0, пропускаем всех. Если в логе пропущенных нет совсем —
        //значит либо повторов нет, либо отпечаток перестал совпадать
        this.logger.log(
            `Участники сделки ${dealId}: в заявке ${fromBid.length}, в сделке было ${existing.length}, заведено ${created.length}, пропущено как повтор ${skipped.length}`,
        );

        return { created, skipped: skipped.length };
    }

    /**
     * Участники, уже привязанные к сделке.
     *
     * Фильтр по parentId2 — это и есть связь сделки с участником, ее ставит
     * прием. Поле ufCrm12DealId хранит тот же номер строкой и остается для
     * фронта; по нему не фильтруем, чтобы не зависеть от двух источников
     * правды. Падение запроса не глушим: без списка существующих приняться
     * нельзя, иначе снова задвоим — лучше отдать заявку крону подхвата
     */
    private async getDealParticipants(
        dealId: number,
    ): Promise<Record<string, unknown>[]> {
        const response = await this.bitrix.item.list(
            this.entityTypeId.toString(),
            {
                categoryId: CategoryIdEnum.PARTICIPANT,
                parentId2: dealId,
            } as never,
            ['id', ...FINGERPRINT_FIELDS],
        );

        return (response?.result?.items ||
            []) as unknown as Record<string, unknown>[];
    }

    public async getList(entityTypeId: string) {
        const smarts = await this.bitrix.item.list(entityTypeId);

        return smarts;
    }

    private async add(
        entityTypeId: EntityTypeIdEnum,
        item: IAlfaParticipantSmartItem,
    ) {
        const smarts = await this.bitrix.item.add(
            entityTypeId as unknown as string,
            item,
        );

        return smarts;
    }
}
