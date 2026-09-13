import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { RedisService } from '@/core/redis/redis.service';
import { CounterGetBxListDto } from '../dto/add-counter-bx-list.dto';

/** Список-справочник счётчиков договоров */
export const COUNTER_IBLOCK_ID = 46;
/** Свойство «Номер» (code=NUMBER) — само значение счётчика */
export const COUNTER_PROP = 'PROPERTY_190';
/** Свойство «Активен» (code=AKTIVEN): 156 — «Да», 158 — «Нет» */
export const ACTIVE_PROP = 'PROPERTY_188';
export const ACTIVE_YES = '156';
export const ACTIVE_NO = '158';

/** Смарт-процесс «Семинары»: старый нумератор в БП хранит там ID счётчика */
export const SEMINAR_ENTITY_TYPE_ID = 159;
export const SMART_PREFIX_FIELD = 'ufCrm8Prefix';
export const SMART_LIST_ID_FIELD = 'ufCrm8ListId';
export const SMART_NUMBER_FIELD = 'ufCrm8NumberCurrentDoc';
/** Родительское поле «Сделка» — им якорь привязывается к сделке */
export const SMART_DEAL_PARENT_FIELD = 'parentId2';
export const SEMINAR_CATEGORY_ID = 16;
/**
 * Якорь сразу закрываем в успех. Это важно не только для чистоты воронки:
 * БП #448 «Редактирование Сделки» запускается на создание карточки и на
 * стадии PREPARATION копирует товары и стартует другие процессы. На SUCCESS
 * он не делает ничего.
 */
export const ANCHOR_STAGE_ID = 'DT159_16:SUCCESS';

/**
 * Файловые поля смарта, по которым видно, что документы уже сформированы.
 * Если хоть одно заполнено, номер в карточке перезаписывать нельзя — он уже
 * попал в договор.
 */
export const SMART_DOCUMENT_FIELDS = [
    'ufCrm8DocxCurrentContractNotPt',
    'ufCrm8_1724325011',
    'ufCrm8DocxCurrentAccountNotPt',
    'ufCrm8_1724325041',
    'ufCrm8CurrentAct',
];

const LOCK_TTL_MS = 20_000;
const LOCK_WAIT_ATTEMPTS = 40;
const LOCK_WAIT_DELAY_MS = 250;
const CALL_ATTEMPTS = 3;
const CALL_RETRY_DELAY_MS = 500;

const RELEASE_LOCK_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
end
return 0
`;

/** Минимальный контракт клиента Битрикса, который нужен счётчику */
export type BitrixApiClient = {
    api: { call: (method: string, params: unknown) => Promise<unknown> };
};

export type CounterElement = {
    elementId: number;
    counter: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Всё, что касается элемента-счётчика в списке 46: поиск, чтение, запись,
 * блокировка. Вынесено в сервис, потому что этим пользуются два сценария —
 * обычная выдача номера из приложения и починка дубля, который завёл
 * бизнес-процесс Битрикса.
 */
@Injectable()
export class DocumentCounterService {
    private readonly logger = new Logger(DocumentCounterService.name);

    constructor(private readonly redisService: RedisService) {}

    /**
     * Чтение, инкремент и запись счётчика идут отдельными запросами к Битриксу.
     * Без блокировки два параллельных процесса прочитают одно значение и
     * выдадут один номер двум договорам.
     */
    async withLock<T>(prefix: string, fn: () => Promise<T>): Promise<T> {
        const key = `document-number:lock:${prefix}`;
        const token = randomUUID();
        const redis = this.redisService.getClient();

        let acquired = false;
        for (let attempt = 1; attempt <= LOCK_WAIT_ATTEMPTS; attempt++) {
            const ok = await redis.set(key, token, 'PX', LOCK_TTL_MS, 'NX');
            if (ok) {
                acquired = true;
                break;
            }
            await sleep(LOCK_WAIT_DELAY_MS);
        }
        if (!acquired) {
            throw new Error(
                `Не удалось занять блокировку счётчика «${prefix}» за ${
                    (LOCK_WAIT_ATTEMPTS * LOCK_WAIT_DELAY_MS) / 1000
                } с`,
            );
        }

        try {
            return await fn();
        } finally {
            try {
                await redis.eval(RELEASE_LOCK_SCRIPT, 1, key, token);
            } catch (error) {
                this.logger.warn(
                    `Не удалось снять блокировку ${key}: ${this.message(error)}`,
                );
            }
        }
    }

    /**
     * Ищет элемент-счётчик так же, как это делает старый нумератор в БП:
     * через карточку смарта 159 с тем же префиксом и заполненным LIST_ID.
     * Иначе бэкенд и БП работают с разными элементами и каждый ведёт свою
     * нумерацию от единицы.
     */
    async findAnchorElementId(
        bitrix: BitrixApiClient,
        prefix: string,
        exclude: { smartId?: number; elementId?: number } = {},
    ): Promise<number | null> {
        const response = await this.call<{
            result?: { items?: Record<string, unknown>[] };
        }>(
            bitrix,
            'crm.item.list',
            {
                entityTypeId: SEMINAR_ENTITY_TYPE_ID,
                select: ['id', SMART_LIST_ID_FIELD],
                filter: {
                    [SMART_PREFIX_FIELD]: prefix,
                    [`!=${SMART_LIST_ID_FIELD}`]: '',
                },
                order: { id: 'ASC' },
            },
            `поиск якоря БП для префикса «${prefix}»`,
        );

        for (const item of response?.result?.items || []) {
            if (exclude.smartId && Number(item.id) === exclude.smartId) continue;
            const id = Number(item[SMART_LIST_ID_FIELD]);
            if (!Number.isFinite(id) || id <= 0) continue;
            if (exclude.elementId && id === exclude.elementId) continue;
            return id;
        }
        return null;
    }

    async readCounter(
        bitrix: BitrixApiClient,
        elementId: number,
        prefix: string,
    ): Promise<number | null> {
        const response = await this.call<{ result?: CounterGetBxListDto[] }>(
            bitrix,
            'lists.element.get',
            {
                IBLOCK_TYPE_ID: 'lists',
                IBLOCK_ID: COUNTER_IBLOCK_ID,
                ELEMENT_ID: elementId,
            },
            `чтение счётчика «${prefix}» по элементу ${elementId}`,
        );
        const element = response?.result?.[0];
        return element ? this.getCounter(element) : null;
    }

    /**
     * Элементы списка 46 с таким названием. Ошибку чтения нельзя трактовать
     * как «префикса нет»: иначе на каждом сбое сети завёлся бы второй счётчик
     * с нумерацией от единицы.
     */
    async findElementsByName(
        bitrix: BitrixApiClient,
        prefix: string,
    ): Promise<CounterElement[]> {
        const response = await this.call<{ result?: CounterGetBxListDto[] }>(
            bitrix,
            'lists.element.get',
            {
                IBLOCK_TYPE_ID: 'lists',
                IBLOCK_ID: COUNTER_IBLOCK_ID,
                FILTER: { NAME: prefix },
            },
            `поиск счётчика «${prefix}» в списке ${COUNTER_IBLOCK_ID}`,
        );

        return (response?.result || []).map((element) => ({
            elementId: Number(element.ID),
            counter: this.getCounter(element),
        }));
    }

    /** Из нескольких элементов на один префикс берём тот, что ушёл дальше всех */
    pickBest(elements: CounterElement[], prefix: string): CounterElement | null {
        if (!elements.length) return null;
        if (elements.length > 1) {
            this.logger.warn(
                `Префикс «${prefix}»: в списке ${COUNTER_IBLOCK_ID} ${
                    elements.length
                } элемента-счётчика (${elements
                    .map((e) => `${e.elementId}=${e.counter}`)
                    .join(', ')}). Беру максимальный, дубли нужно схлопнуть.`,
            );
        }
        return elements.reduce((acc, e) => (e.counter > acc.counter ? e : acc));
    }

    /**
     * lists.element.update перезаписывает элемент целиком: непереданные поля
     * очищаются. У списка 46 всего три поля, и все три передаём здесь.
     */
    async writeCounter(
        bitrix: BitrixApiClient,
        elementId: number,
        prefix: string,
        counter: number,
        active: string = ACTIVE_YES,
    ): Promise<void> {
        await this.call<unknown>(
            bitrix,
            'lists.element.update',
            {
                ELEMENT_ID: elementId,
                IBLOCK_TYPE_ID: 'lists',
                IBLOCK_ID: COUNTER_IBLOCK_ID,
                FIELDS: {
                    NAME: prefix,
                    [ACTIVE_PROP]: active,
                    [COUNTER_PROP]: counter,
                },
            },
            `запись счётчика «${prefix}» в элемент ${elementId}`,
        );
    }

    /** Гасит лишний элемент-счётчик, не удаляя: история остаётся видна */
    async deactivateElement(
        bitrix: BitrixApiClient,
        elementId: number,
        prefix: string,
        counter: number,
    ): Promise<void> {
        await this.writeCounter(
            bitrix,
            elementId,
            prefix,
            counter,
            ACTIVE_NO,
        );
        this.logger.warn(
            `Префикс «${prefix}»: элемент ${elementId} помечен неактивным как дубль`,
        );
    }

    async createElement(
        bitrix: BitrixApiClient,
        prefix: string,
    ): Promise<number> {
        const response = await this.call<{ result?: number | string }>(
            bitrix,
            'lists.element.add',
            {
                IBLOCK_TYPE_ID: 'lists',
                // Символьный код — единственное поле, по которому инфоблок
                // умеет запрещать повторы. Проставляем сразу, чтобы после
                // схлопывания дублей можно было включить проверку уникальности.
                ELEMENT_CODE: this.transliterate(prefix),
                IBLOCK_ID: COUNTER_IBLOCK_ID,
                FIELDS: {
                    CREATED_BY: 514,
                    NAME: prefix,
                    [COUNTER_PROP]: 1,
                    [ACTIVE_PROP]: ACTIVE_YES,
                },
            },
            `создание счётчика «${prefix}»`,
        );

        const elementId = Number(response?.result);
        if (!Number.isFinite(elementId) || elementId <= 0) {
            throw new Error(
                `Битрикс не вернул ID нового счётчика для префикса «${prefix}»`,
            );
        }
        return elementId;
    }

    /**
     * Вызов Битрикса с повторами. Нужен из-за автоблокировки элементов
     * списка: занятый элемент отдаёт ошибку, а терять номер из-за этого нельзя.
     */
    async call<T>(
        bitrix: BitrixApiClient,
        method: string,
        params: unknown,
        what: string,
    ): Promise<T> {
        let lastError: unknown;
        for (let attempt = 1; attempt <= CALL_ATTEMPTS; attempt++) {
            try {
                return (await bitrix.api.call(method, params)) as T;
            } catch (error) {
                lastError = error;
                this.logger.warn(
                    `${what}: попытка ${attempt} из ${CALL_ATTEMPTS} не удалась — ${this.message(
                        error,
                    )}`,
                );
                if (attempt < CALL_ATTEMPTS) {
                    await sleep(CALL_RETRY_DELAY_MS * attempt);
                }
            }
        }
        throw new Error(
            `${what}: ${CALL_ATTEMPTS} попытки подряд неудачны — ${this.message(
                lastError,
            )}`,
        );
    }

    getCounter(dto: CounterGetBxListDto): number {
        const raw = dto[COUNTER_PROP as keyof CounterGetBxListDto];
        if (raw == null) return 0;
        const values =
            typeof raw === 'object' ? Object.values(raw) : [raw as unknown];
        const numbers = values
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value));
        return numbers.length ? Math.max(...numbers) : 0;
    }

    message(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }

    transliterate(text: string): string {
        const map: Record<string, string> = {
            а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
            з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
            п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
            ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e',
            ю: 'yu', я: 'ya',
        };
        return text
            .toLowerCase()
            .split('')
            .map((char) => map[char] ?? char)
            .join('')
            .replace(/[^a-z0-9_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
