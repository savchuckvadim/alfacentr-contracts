import { PBXService } from '@/modules/pbx/pbx.servise';
import { Injectable, Logger } from '@nestjs/common';
import { normalizePrefix } from '@alfa/entities';
import {
    BitrixApiClient,
    DocumentCounterService,
    SEMINAR_ENTITY_TYPE_ID,
    SMART_DOCUMENT_FIELDS,
    SMART_LIST_ID_FIELD,
    SMART_NUMBER_CURRENT_DOC_FIELD,
    SMART_NUMBER_DOC_FIELD,
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

/** Чем закончилась одна перепроверка карточки после починки */
export type VerifyOutcome =
    /** Карточка в том виде, в каком её оставила починка */
    | 'intact'
    /** То же, и документы уже сформированы — наш номер в договоре */
    | 'settled'
    /** БП затёр запись своей единицей, записали заново */
    | 'reapplied'
    /** Карточку изменил кто-то другой — наша запись устарела, не трогаем */
    | 'changed-by-other'
    /** БП затёр запись, и документы успели сформировать с его номером */
    | 'stale-in-documents'
    | 'unreadable';

/**
 * Через сколько после починки перепроверять карточку.
 *
 * БП не ждёт ответа на вебхук: он ставит вызов в очередь и сразу пишет в
 * карточку свой счётчик и единицу. На практике вебхук доходит секунд через
 * десять, и наша запись ложится последней. Но порядок никем не гарантирован,
 * поэтому дважды смотрим, не вернул ли БП своё.
 */
const VERIFY_DELAYS_MS = [5_000, 20_000];

/** Поля карточки приходят как unknown; номер — строкой или числом */
const asText = (value: unknown): string =>
    typeof value === 'string' || typeof value === 'number'
        ? String(value).trim()
        : '';

/**
 * Починка расхождения, которое устроил старый нумератор в БП Битрикса.
 *
 * БП ищет счётчик не в списке 46, а через карточку смарта с тем же префиксом и
 * заполненным LIST_ID. Не найдя такой карточки, он создаёт свой элемент списка
 * с номером 1 — и с этого момента существуют две независимые нумерации. Так
 * бывает с первой карточкой смарта по префиксу, который начало приложение:
 * сделок БП не видит.
 *
 * Исходящий вебхук из ветки «Таких семинаров нет» зовёт этот сценарий сразу
 * после создания элемента. Здесь мы:
 * 1. находим канонический счётчик по префиксу, исключая только что созданный;
 * 2. выдаём из него следующий номер под блокировкой;
 * 3. перецеливаем LIST_ID карточки на канонический элемент, чтобы следующий
 *    прогон БП пошёл уже по нему;
 * 4. пишем номер в карточку — в «Номер документа», из которого печатается
 *    договор, и в «Номер текущего договора». Только если документы по ней ещё
 *    не сформированы: иначе номер уже в договоре и менять его нельзя;
 * 5. гасим созданный дубль, не удаляя;
 * 6. через несколько секунд перепроверяем карточку и повторяем запись, если
 *    БП вернул свои значения.
 */
@Injectable()
export class HealCounterDuplicateUseCase {
    private readonly logger = new Logger(HealCounterDuplicateUseCase.name);

    /** Полем, а не константой в коде: тесты не должны ждать реальные секунды */
    protected verifyDelaysMs: number[] = VERIFY_DELAYS_MS;

    /** Перепроверка, запущенная последним вызовом, — чтобы её можно было дождаться */
    private verification: Promise<void> = Promise.resolve();

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

        const result = await this.counters.withLock(prefix, () =>
            this.heal(bitrix, prefix, smartId, duplicateElementId, item),
        );

        // Вне блокировки и без ожидания: перепроверка счётчик не трогает, а
        // вебхуку нужен быстрый ответ
        this.scheduleVerification(bitrix, result);

        return result;
    }

    /** Дожидается перепроверки, запущенной последним вызовом execute */
    whenVerified(): Promise<void> {
        return this.verification;
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

        await this.writeCard(
            bitrix,
            smartId,
            canonical.elementId,
            documentsAlreadyBuilt ? null : counter,
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
     * Запись починки в карточку: ссылка на рабочий счётчик и, если можно,
     * номер. Номер идёт в оба поля сразу — договор печатается из «Номер
     * документа», а «Номер текущего договора» держим тем же, чтобы карточка
     * не противоречила сама себе до генерации.
     */
    private async writeCard(
        bitrix: BitrixApiClient,
        smartId: number,
        elementId: number,
        counter: number | null,
        what: string,
    ): Promise<void> {
        const fields: Record<string, unknown> = {
            [SMART_LIST_ID_FIELD]: elementId,
        };
        if (counter !== null) {
            fields[SMART_NUMBER_DOC_FIELD] = String(counter);
            fields[SMART_NUMBER_CURRENT_DOC_FIELD] = String(counter);
        }

        await this.counters.call<unknown>(
            bitrix,
            'crm.item.update',
            { entityTypeId: SEMINAR_ENTITY_TYPE_ID, id: smartId, fields },
            what,
        );
    }

    private scheduleVerification(
        bitrix: BitrixApiClient,
        healed: HealCounterDuplicateResult,
    ): void {
        if (healed.action !== 'healed' && healed.action !== 'repointed-only') {
            return;
        }

        this.verification = this.verify(bitrix, healed).catch((error) => {
            this.logger.error(
                `Вебхук БП, перепроверка карточки ${healed.smartId} не удалась: ${this.counters.message(
                    error,
                )}`,
            );
        });
    }

    private async verify(
        bitrix: BitrixApiClient,
        healed: HealCounterDuplicateResult,
    ): Promise<void> {
        for (const delay of this.verifyDelaysMs) {
            await this.sleep(delay);

            const outcome = await this.verifyOnce(bitrix, healed);

            // Дальше смотреть незачем: номер уже в договоре либо карточку
            // изменил кто-то другой, и наша запись устарела
            if (
                outcome === 'settled' ||
                outcome === 'changed-by-other' ||
                outcome === 'stale-in-documents'
            ) {
                return;
            }
        }
    }

    /**
     * Одна перепроверка. Запись повторяем только в одном случае — когда в
     * карточке стоит ссылка на элемент, который БП создал именно в этом
     * прогоне. Это подпись его записи: тем же шагом он ставит и единицу.
     *
     * Любое другое расхождение — не повод переписывать. Номер мог смениться
     * законно: пришёл следующий вебхук по этой же карточке или БП после правки
     * товаров выдал ей новый номер из общего счётчика. Вернув своё значение,
     * мы бы затёрли более свежий номер.
     */
    private async verifyOnce(
        bitrix: BitrixApiClient,
        healed: HealCounterDuplicateResult,
    ): Promise<VerifyOutcome> {
        const { smartId, prefix, canonicalElementId, duplicateElementId } =
            healed;
        if (!canonicalElementId) return 'changed-by-other';

        const item = await this.loadSmartItem(bitrix, smartId);
        if (!item) return 'unreadable';

        const listId = Number(item[SMART_LIST_ID_FIELD]) || null;
        const numberDoc = asText(item[SMART_NUMBER_DOC_FIELD]);
        const expected =
            healed.numberWritten && healed.counter !== null
                ? String(healed.counter)
                : null;
        const documentsBuilt = this.hasDocuments(item);

        const listOk = listId === canonicalElementId;
        const numberOk = expected === null || numberDoc === expected;
        if (listOk && numberOk) {
            return documentsBuilt ? 'settled' : 'intact';
        }

        const overwrittenByBp =
            duplicateElementId !== null && listId === duplicateElementId;
        if (!overwrittenByBp) {
            this.logger.warn(
                `Вебхук БП, перепроверка, префикс «${prefix}», карточка ${smartId}: карточку изменил кто-то другой (счётчик ${listId}, номер «${numberDoc}», ждали счётчик ${canonicalElementId}, номер «${expected ?? 'без изменений'}»). Запись не повторяем.`,
            );
            return 'changed-by-other';
        }

        const canWriteNumber = expected !== null && !documentsBuilt;
        await this.writeCard(
            bitrix,
            smartId,
            canonicalElementId,
            canWriteNumber ? healed.counter : null,
            `повторная запись починки в карточку ${smartId}`,
        );

        if (expected !== null && documentsBuilt) {
            this.logger.error(
                `Вебхук БП, перепроверка, префикс «${prefix}», карточка ${smartId}: БП вернул свой номер «${numberDoc}», и документы уже сформированы с ним. Выданный номер ${expected} в договор не попал — нужна ручная проверка. Счётчик карточки возвращён на ${canonicalElementId}.`,
            );
            return 'stale-in-documents';
        }

        this.logger.warn(
            `Вебхук БП, перепроверка, префикс «${prefix}», карточка ${smartId}: БП затёр запись (счётчик ${listId}, номер «${numberDoc}»), записали заново — счётчик ${canonicalElementId}, номер «${expected ?? 'без изменений'}»`,
        );
        return 'reapplied';
    }

    /**
     * Канонический счётчик — это элемент, которым пользуется приложение:
     * сначала по другой карточке смарта, затем элемент списка по названию.
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

    protected sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
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
