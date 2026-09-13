import { PBXService } from '@/modules/pbx/pbx.servise';
import { Injectable, Logger } from '@nestjs/common';
import { normalizePrefix } from '@alfa/entities';
import {
    BitrixApiClient,
    DocumentCounterService,
    SEMINAR_ENTITY_TYPE_ID,
    SMART_DOCUMENT_FIELDS,
    SMART_LIST_ID_FIELD,
    SMART_NUMBER_FIELD,
    SMART_PREFIX_FIELD,
} from '../services/document-counter.service';
import { BpCounterCreatedDto } from '../dto/bp-counter-created.dto';

export type HealAction =
    | 'nothing-to-heal'
    | 'healed'
    | 'repointed-only'
    | 'skipped-no-prefix';

export interface HealCounterDuplicateResult {
    action: HealAction;
    prefix: string;
    smartId: number;
    /** Элемент, который завёл бизнес-процесс */
    duplicateElementId: number | null;
    /** Элемент, который остаётся рабочим */
    canonicalElementId: number | null;
    /** Номер, выданный из канонического счётчика */
    counter: number | null;
    /** Записан ли номер в карточку смарта */
    numberWritten: boolean;
    documentsAlreadyBuilt: boolean;
}

/**
 * Починка расхождения, которое устроил старый нумератор в БП Битрикса.
 *
 * БП ищет счётчик не в списке 46, а через карточку смарта с тем же префиксом и
 * заполненным LIST_ID. Не найдя такой карточки, он создаёт свой элемент списка
 * с номером 1 — и с этого момента существуют две независимые нумерации.
 *
 * Исходящий вебхук из ветки «Таких семинаров нет» зовёт этот сценарий сразу
 * после создания элемента. Здесь мы:
 * 1. находим канонический счётчик по префиксу, исключая только что созданный;
 * 2. выдаём из него следующий номер под блокировкой;
 * 3. перецеливаем LIST_ID карточки на канонический элемент, чтобы следующий
 *    прогон БП пошёл уже по нему;
 * 4. пишем номер в карточку, но только если документы по ней ещё не
 *    сформированы — иначе номер уже в договоре и менять его нельзя;
 * 5. гасим созданный дубль, не удаляя.
 */
@Injectable()
export class HealCounterDuplicateUseCase {
    private readonly logger = new Logger(HealCounterDuplicateUseCase.name);

    constructor(
        private readonly pbxService: PBXService,
        private readonly counters: DocumentCounterService,
    ) {}

    async execute(
        dto: BpCounterCreatedDto,
    ): Promise<HealCounterDuplicateResult> {
        const smartId = Number(dto.smartId);
        const duplicateElementId = Number(dto.elementId) || null;
        const { bitrix } = await this.pbxService.init('alfacentr.bitrix24.ru');

        const item = await this.loadSmartItem(bitrix, smartId);
        const prefix = normalizePrefix(
            dto.prefix || (item?.[SMART_PREFIX_FIELD] as string),
        );

        if (!prefix) {
            this.logger.warn(
                `Вебхук БП по карточке ${smartId}: префикс пустой, чинить нечего`,
            );
            return this.result('skipped-no-prefix', {
                prefix,
                smartId,
                duplicateElementId,
            });
        }

        return await this.counters.withLock(prefix, () =>
            this.heal(bitrix, prefix, smartId, duplicateElementId, item),
        );
    }

    private async heal(
        bitrix: BitrixApiClient,
        prefix: string,
        smartId: number,
        duplicateElementId: number | null,
        item: Record<string, unknown> | null,
    ): Promise<HealCounterDuplicateResult> {
        const canonical = await this.findCanonical(
            bitrix,
            prefix,
            smartId,
            duplicateElementId,
        );

        if (!canonical) {
            // Элемент, созданный БП, оказался единственным на этот префикс —
            // расхождения нет, нумерация продолжится по нему.
            this.logger.log(
                `Вебхук БП, префикс «${prefix}»: элемент ${duplicateElementId} единственный, чинить нечего`,
            );
            return this.result('nothing-to-heal', {
                prefix,
                smartId,
                duplicateElementId,
                canonicalElementId: duplicateElementId,
            });
        }

        const counter = canonical.counter + 1;
        await this.counters.writeCounter(
            bitrix,
            canonical.elementId,
            prefix,
            counter,
        );

        const documentsAlreadyBuilt = this.hasDocuments(item);
        const fields: Record<string, unknown> = {
            [SMART_LIST_ID_FIELD]: canonical.elementId,
        };
        if (!documentsAlreadyBuilt) {
            fields[SMART_NUMBER_FIELD] = String(counter);
        }

        await this.counters.call<unknown>(
            bitrix,
            'crm.item.update',
            { entityTypeId: SEMINAR_ENTITY_TYPE_ID, id: smartId, fields },
            `перецеливание карточки ${smartId} на счётчик ${canonical.elementId}`,
        );

        if (duplicateElementId) {
            const duplicateCounter =
                (await this.counters.readCounter(
                    bitrix,
                    duplicateElementId,
                    prefix,
                )) ?? 0;
            await this.counters.deactivateElement(
                bitrix,
                duplicateElementId,
                prefix,
                duplicateCounter,
            );
        }

        if (documentsAlreadyBuilt) {
            this.logger.warn(
                `Вебхук БП, префикс «${prefix}», карточка ${smartId}: документы уже сформированы, номер в карточке не меняли. Счётчик ${canonical.elementId} доведён до ${counter}, номер в карточке остался дублем — нужна ручная проверка.`,
            );
        } else {
            this.logger.log(
                `Вебхук БП, префикс «${prefix}», карточка ${smartId}: номер ${counter} из счётчика ${canonical.elementId}, дубль ${duplicateElementId} погашен`,
            );
        }

        return this.result(
            documentsAlreadyBuilt ? 'repointed-only' : 'healed',
            {
                prefix,
                smartId,
                duplicateElementId,
                canonicalElementId: canonical.elementId,
                counter,
                numberWritten: !documentsAlreadyBuilt,
                documentsAlreadyBuilt,
            },
        );
    }

    /**
     * Канонический счётчик — это элемент, которым пользуется приложение:
     * сначала якорь другой карточки смарта, затем элемент списка по названию.
     * Свежесозданный БП элемент и саму карточку из поиска исключаем.
     */
    private async findCanonical(
        bitrix: BitrixApiClient,
        prefix: string,
        smartId: number,
        duplicateElementId: number | null,
    ) {
        const anchorId = await this.counters.findAnchorElementId(
            bitrix,
            prefix,
            { smartId, elementId: duplicateElementId ?? undefined },
        );
        if (anchorId) {
            const counter = await this.counters.readCounter(
                bitrix,
                anchorId,
                prefix,
            );
            if (counter !== null) return { elementId: anchorId, counter };
        }

        const elements = await this.counters.findElementsByName(bitrix, prefix);
        const candidates = elements.filter(
            (e) => e.elementId !== duplicateElementId,
        );
        return this.counters.pickBest(candidates, prefix);
    }

    private async loadSmartItem(
        bitrix: BitrixApiClient,
        smartId: number,
    ): Promise<Record<string, unknown> | null> {
        try {
            const response = await this.counters.call<{
                result?: { item?: Record<string, unknown> };
            }>(
                bitrix,
                'crm.item.get',
                { entityTypeId: SEMINAR_ENTITY_TYPE_ID, id: smartId },
                `чтение карточки смарта ${smartId}`,
            );
            return response?.result?.item ?? null;
        } catch (error) {
            this.logger.warn(
                `Карточка смарта ${smartId} не прочитана: ${this.counters.message(
                    error,
                )}`,
            );
            return null;
        }
    }

    /** Хотя бы один файл договора или счёта означает, что номер уже в документе */
    private hasDocuments(item: Record<string, unknown> | null): boolean {
        if (!item) {
            // Карточку прочитать не удалось — считаем, что документы есть:
            // не перезаписать номер безопаснее, чем перезаписать вслепую.
            return true;
        }
        return SMART_DOCUMENT_FIELDS.some((field) => {
            const value = item[field];
            if (value == null) return false;
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'string') return value.trim() !== '';
            if (typeof value === 'number') return true;
            // Файл приходит объектом с id и url — значит он есть
            return typeof value === 'object';
        });
    }

    private result(
        action: HealAction,
        partial: Partial<HealCounterDuplicateResult> & {
            prefix: string;
            smartId: number;
        },
    ): HealCounterDuplicateResult {
        return {
            action,
            duplicateElementId: null,
            canonicalElementId: null,
            counter: null,
            numberWritten: false,
            documentsAlreadyBuilt: false,
            ...partial,
        };
    }
}
