import {
    SEMINAR_ENTITY_TYPE_ID,
    SMART_NUMBER_CURRENT_DOC_FIELD,
    SMART_NUMBER_DOC_FIELD,
    SMART_PREFIX_FIELD,
} from '@/modules/document-number/services/document-counter.service';

/** Поля сделки, куда БП переносит префикс и номер договора */
export const DEAL_PREFIX_FIELD = 'UF_CRM_8_PREFIX';
export const DEAL_NUMBER_DOC_FIELD = 'UF_CRM_8_NUMBER_DOC';
export const DEAL_NUMBER_CURRENT_DOC_FIELD = 'UF_CRM_8_NUMBER_CURRENT_DOC';

/** За сколько часов смотреть изменённые записи по умолчанию */
export const DEFAULT_LOOKBACK_HOURS = 72;
/** Страховка от бесконечного обхода страниц: 200 страниц по 50 записей */
const MAX_PAGES = 200;

/** Минимальный контракт клиента Битрикса: отдаёт сырой ответ REST */
export type BitrixCaller = {
    api: {
        call: (
            method: string,
            params: Record<string, unknown>,
        ) => Promise<unknown>;
    };
};

export type HolderKind = 'smart' | 'deal';

/** Запись, которая «держит» номер договора: карточка смарта или сделка */
export interface NumberHolder {
    kind: HolderKind;
    id: number;
    prefix: string;
    number: string;
}

/** Один номер договора, который стоит у двух и более записей */
export interface NumberCollision {
    /** Префикс и номер в нормализованном виде, например «СН1910И-1» */
    key: string;
    holders: NumberHolder[];
}

export interface NumberDuplicatesResult {
    /** Сколько недавно изменённых записей с префиксом попало в проверку */
    recentChecked: number;
    /** По скольким префиксам загружена вся история */
    prefixesChecked: number;
    collisions: NumberCollision[];
    errors: string[];
}

/** Поля приходят как unknown: строка или число, всё остальное считаем пустым */
const asText = (value: unknown): string =>
    typeof value === 'string' || typeof value === 'number'
        ? String(value).trim()
        : '';

/** Регистр и пробелы в префиксе не должны прятать повтор */
export const normalizePrefix = (value: unknown): string =>
    asText(value).toUpperCase();

/** «01» и «1» — один и тот же номер; нечисловое значение оставляем как есть */
export const normalizeNumber = (value: unknown): string => {
    const text = asText(value);
    return /^\d+$/.test(text) ? String(Number(text)) : text;
};

type RawItem = Record<string, unknown>;

/**
 * Номер карточки смарта. «Номер документа» — источник, из него печатается
 * договор; «Номер текущего договора» — запасной вариант, след после генерации
 */
export const toSmartHolder = (item: RawItem): NumberHolder => ({
    kind: 'smart',
    id: Number(item.id),
    prefix: normalizePrefix(item[SMART_PREFIX_FIELD]),
    number:
        normalizeNumber(item[SMART_NUMBER_DOC_FIELD]) ||
        normalizeNumber(item[SMART_NUMBER_CURRENT_DOC_FIELD]),
});

/**
 * Номер сделки. У сделок «Номер документа» пустой, номер лежит в «Номере
 * текущего договора», поэтому порядок обратный смарту. Если сравнивать
 * сделки по «Номеру документа», проверка не найдёт ничего и промолчит
 */
export const toDealHolder = (item: RawItem): NumberHolder => ({
    kind: 'deal',
    id: Number(item.ID),
    prefix: normalizePrefix(item[DEAL_PREFIX_FIELD]),
    number:
        normalizeNumber(item[DEAL_NUMBER_CURRENT_DOC_FIELD]) ||
        normalizeNumber(item[DEAL_NUMBER_DOC_FIELD]),
});

export const holderRef = (holder: NumberHolder): string =>
    `${holder.kind}:${holder.id}`;

/**
 * Группирует записи по паре «префикс-номер» и оставляет группы из двух и более
 * записей, в которых есть хотя бы одна недавно изменённая. Старые повторы,
 * до которых никто не дотрагивался, в отчёт не попадают.
 */
export const findCollisions = (
    holders: NumberHolder[],
    recentRefs: Set<string>,
): NumberCollision[] => {
    const groups = new Map<string, Map<string, NumberHolder>>();

    for (const holder of holders) {
        if (!holder.prefix || !holder.number || !Number.isFinite(holder.id)) {
            continue;
        }
        const key = `${holder.prefix}-${holder.number}`;
        const group = groups.get(key) ?? new Map<string, NumberHolder>();
        //одну запись могли загрузить дважды — считаем её один раз
        group.set(holderRef(holder), holder);
        groups.set(key, group);
    }

    const collisions: NumberCollision[] = [];
    for (const [key, group] of groups) {
        if (group.size < 2) continue;
        if (![...group.keys()].some((ref) => recentRefs.has(ref))) continue;

        const members = [...group.values()].sort((a, b) =>
            a.kind === b.kind ? a.id - b.id : a.kind === 'smart' ? -1 : 1,
        );
        collisions.push({ key, holders: members });
    }

    return collisions.sort((a, b) => a.key.localeCompare(b.key, 'ru'));
};

/**
 * Поиск повторяющихся номеров договоров среди карточек смарта «Семинары» и
 * сделок.
 *
 * Не обходит весь портал: это 8,5 тысячи карточек и три минуты запросов, а лимит
 * вебхука общий с рабочими запросами приложения. Вместо этого берёт записи,
 * изменённые за последние часы, и для каждого их префикса загружает всю
 * историю — это десятки записей. Повтор ищется внутри префикса, потому что
 * номер у договора составной: «СН1910И-1».
 */
export class NumberDuplicatesService {
    constructor(
        private readonly bitrix: BitrixCaller,
        private readonly lookbackHours: number = DEFAULT_LOOKBACK_HOURS,
    ) {}

    async run(now: Date = new Date()): Promise<NumberDuplicatesResult> {
        const result: NumberDuplicatesResult = {
            recentChecked: 0,
            prefixesChecked: 0,
            collisions: [],
            errors: [],
        };

        const since = new Date(
            now.getTime() - this.lookbackHours * 3_600_000,
        ).toISOString();

        const recentSmart = await this.listSmart({
            '>=updatedTime': since,
            [`!=${SMART_PREFIX_FIELD}`]: '',
        });
        const recentDeals = await this.listDeals({
            '>=DATE_MODIFY': since,
            [`!=${DEAL_PREFIX_FIELD}`]: '',
        });

        result.recentChecked = recentSmart.length + recentDeals.length;

        const recentRefs = new Set<string>([
            ...recentSmart.map((item) => holderRef(toSmartHolder(item))),
            ...recentDeals.map((item) => holderRef(toDealHolder(item))),
        ]);

        //в фильтр уходит префикс в том виде, как он лежит в записи, а не
        //нормализованный: Битрикс сравнивает строку точно
        const rawPrefixes = new Set<string>();
        for (const item of recentSmart) {
            rawPrefixes.add(asText(item[SMART_PREFIX_FIELD]));
        }
        for (const item of recentDeals) {
            rawPrefixes.add(asText(item[DEAL_PREFIX_FIELD]));
        }

        const holders: NumberHolder[] = [];
        for (const prefix of rawPrefixes) {
            if (!prefix) continue;
            try {
                const smart = await this.listSmart({
                    [SMART_PREFIX_FIELD]: prefix,
                });
                const deals = await this.listDeals({
                    [DEAL_PREFIX_FIELD]: prefix,
                });
                holders.push(
                    ...smart.map(toSmartHolder),
                    ...deals.map(toDealHolder),
                );
                result.prefixesChecked++;
            } catch (error) {
                //сбой одного префикса не должен прятать остальные
                result.errors.push(
                    `префикс «${prefix}»: ${this.message(error)}`,
                );
            }
        }

        result.collisions = findCollisions(holders, recentRefs);
        return result;
    }

    private async listSmart(
        filter: Record<string, unknown>,
    ): Promise<RawItem[]> {
        return await this.listAll(
            'crm.item.list',
            {
                entityTypeId: SEMINAR_ENTITY_TYPE_ID,
                select: [
                    'id',
                    SMART_PREFIX_FIELD,
                    SMART_NUMBER_DOC_FIELD,
                    SMART_NUMBER_CURRENT_DOC_FIELD,
                ],
                filter,
                order: { id: 'ASC' },
            },
            (response) =>
                (response?.result as { items?: unknown } | undefined)?.items,
        );
    }

    private async listDeals(
        filter: Record<string, unknown>,
    ): Promise<RawItem[]> {
        return await this.listAll(
            'crm.deal.list',
            {
                select: [
                    'ID',
                    DEAL_PREFIX_FIELD,
                    DEAL_NUMBER_DOC_FIELD,
                    DEAL_NUMBER_CURRENT_DOC_FIELD,
                ],
                filter,
                order: { ID: 'ASC' },
            },
            (response) => response?.result,
        );
    }

    /** Битрикс отдаёт по 50 записей: без обхода страниц хвост потерялся бы */
    private async listAll(
        method: string,
        params: Record<string, unknown>,
        pick: (response: ListResponse) => unknown,
    ): Promise<RawItem[]> {
        const items: RawItem[] = [];
        let start = 0;

        for (let page = 0; page < MAX_PAGES; page++) {
            const response = (await this.bitrix.api.call(method, {
                ...params,
                start,
            })) as ListResponse;

            const chunk = pick(response);
            if (Array.isArray(chunk)) items.push(...(chunk as RawItem[]));

            const next = response?.next;
            //то же смещение или пустая страница — выходим, чтобы не зациклиться
            if (typeof next !== 'number' || next <= start) break;
            start = next;
        }

        return items;
    }

    private message(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}

/** Сырой ответ crm.item.list и crm.deal.list: у смарта записи в result.items, у сделок в result */
type ListResponse = {
    result?: unknown;
    next?: number;
};
