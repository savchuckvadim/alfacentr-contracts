import { PBXService } from '@/modules/pbx/pbx.servise';
import { Injectable, Logger } from '@nestjs/common';
import { normalizePrefix } from '@alfa/entities';
import { DocumentNumberByPrefixDto } from '../dto/document-number.dto';
import {
    ANCHOR_STAGE_ID,
    BitrixApiClient,
    DocumentCounterService,
    SEMINAR_CATEGORY_ID,
    SEMINAR_ENTITY_TYPE_ID,
    SMART_DEAL_PARENT_FIELD,
    SMART_LIST_ID_FIELD,
    SMART_PREFIX_FIELD,
} from '../services/document-counter.service';

/** Откуда взяли элемент-счётчик — нужно для диагностики расхождений */
export type CounterSource = 'smart-anchor' | 'list-by-name' | 'created';

export interface DocumentNumberByPrefixResult {
    prefix: string;
    counter: number;
    elementId: number;
    source: CounterSource;
}

@Injectable()
export class DocumentNumberByPrefixUseCase {
    private readonly logger = new Logger(DocumentNumberByPrefixUseCase.name);

    constructor(
        private readonly pbxService: PBXService,
        private readonly counters: DocumentCounterService,
    ) {}

    async execute(
        dto: DocumentNumberByPrefixDto,
    ): Promise<DocumentNumberByPrefixResult> {
        const prefix = normalizePrefix(dto.prefix || dto.dinamycPrefix);
        if (!prefix) {
            throw new Error(
                `Пустой префикс, номер выдать нельзя. dealId=${dto.dealId}`,
            );
        }

        return await this.counters.withLock(prefix, () =>
            this.issueNumber(prefix, dto.dealId),
        );
    }

    private async issueNumber(
        prefix: string,
        dealId: number,
    ): Promise<DocumentNumberByPrefixResult> {
        const { bitrix } = await this.pbxService.init('alfacentr.bitrix24.ru');

        const found = await this.resolveCounterElement(bitrix, prefix);

        if (!found) {
            const elementId = await this.counters.createElement(bitrix, prefix);
            this.logger.log(
                `Создан счётчик для префикса «${prefix}»: элемент ${elementId}, номер 1 (сделка ${dealId})`,
            );
            await this.createSmartAnchor(bitrix, prefix, elementId, dealId);
            return { prefix, counter: 1, elementId, source: 'created' };
        }

        const counter = found.counter + 1;
        await this.counters.writeCounter(
            bitrix,
            found.elementId,
            prefix,
            counter,
        );

        this.logger.log(
            `Префикс «${prefix}»: номер ${counter}, элемент ${found.elementId}, источник ${found.source} (сделка ${dealId})`,
        );

        return {
            prefix,
            counter,
            elementId: found.elementId,
            source: found.source,
        };
    }

    /**
     * Порядок важен:
     * 1. Якорь БП — карточка смарта 159 с этим префиксом и заполненным
     *    LIST_ID. Именно по ней БП находит счётчик, и если она есть,
     *    брать надо тот же элемент.
     * 2. Элемент списка 46 по названию — счётчик, который мы завели сами,
     *    когда карточек смарта с таким префиксом ещё не было.
     */
    private async resolveCounterElement(
        bitrix: BitrixApiClient,
        prefix: string,
    ): Promise<{
        elementId: number;
        counter: number;
        source: CounterSource;
    } | null> {
        const anchorId = await this.counters.findAnchorElementId(
            bitrix,
            prefix,
        );
        if (anchorId) {
            const counter = await this.counters.readCounter(
                bitrix,
                anchorId,
                prefix,
            );
            if (counter !== null) {
                return { elementId: anchorId, counter, source: 'smart-anchor' };
            }
            this.logger.warn(
                `Префикс «${prefix}»: карточка смарта ссылается на элемент ${anchorId}, но его нет в списке счётчиков`,
            );
        }

        const elements = await this.counters.findElementsByName(bitrix, prefix);
        const best = this.counters.pickBest(elements, prefix);
        return best ? { ...best, source: 'list-by-name' } : null;
    }

    /**
     * Создаёт карточку-якорь в смарте 159 для нового префикса.
     *
     * Старый нумератор в БП ищет счётчик не в списке 46, а через карточку
     * смарта с тем же префиксом и заполненным LIST_ID. Если такой карточки
     * нет, он создаёт свой второй элемент списка и начинает нумерацию заново —
     * именно так и разъехались 24 префикса. Якорь даёт БП найти наш счётчик,
     * и править сам БП для этого не требуется.
     *
     * Ошибка создания якоря не должна ломать выдачу номера: номер уже выдан и
     * корректен, поэтому здесь только предупреждение в лог.
     */
    private async createSmartAnchor(
        bitrix: BitrixApiClient,
        prefix: string,
        elementId: number,
        dealId: number,
    ): Promise<void> {
        try {
            const response = await this.counters.call<{
                result?: { item?: { id?: number } };
            }>(
                bitrix,
                'crm.item.add',
                {
                    entityTypeId: SEMINAR_ENTITY_TYPE_ID,
                    fields: {
                        title: `Счётчик нумерации ${prefix}`,
                        categoryId: SEMINAR_CATEGORY_ID,
                        stageId: ANCHOR_STAGE_ID,
                        [SMART_PREFIX_FIELD]: prefix,
                        [SMART_LIST_ID_FIELD]: elementId,
                        [SMART_DEAL_PARENT_FIELD]: dealId,
                    },
                },
                `создание якоря смарта для префикса «${prefix}»`,
            );

            this.logger.log(
                `Якорь для «${prefix}»: карточка смарта ${response?.result?.item?.id} -> счётчик ${elementId}`,
            );
        } catch (error) {
            this.logger.warn(
                `Якорь для «${prefix}» не создан: ${this.counters.message(
                    error,
                )}. Номер выдан, но БП может завести второй счётчик — проверьте префикс в списке счётчиков.`,
            );
        }
    }
}
