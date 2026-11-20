/**
 * Правила постановки заявки в очередь. Чистые функции без обращений к
 * порталу и Redis — чтобы гонять их в jest.
 */

/**
 * Сколько Bull держит выполненную задачу, прежде чем забыть про её jobId.
 *
 * Дедупликация у Bull работает, пока задача лежит в очереди: повторный add
 * с тем же jobId игнорируется. Нам нужно пережить пачку вебхуков по одной
 * сделке — 16.11.2026 Битрикс прислал пять запросов по сделке 204098 за
 * десять секунд. Пяти минут хватает с большим запасом; дальше ту же сделку
 * уже можно принять заново (например, менеджер пересоздал заявку).
 */
export const DEAL_INIT_JOB_KEEP_MS = 5 * 60 * 1000;

/** Приём идёт строго по одной заявке: параллельные прогоны затирают друг друга */
export const DEAL_INIT_CONCURRENCY = 1;

/**
 * Повторы при падении: приём не идемпотентен (товары ставятся заменой
 * состава, участники добавляются), поэтому автоповтор опасен — лучше
 * оставить сделку пустой и отдать её крону подхвата, который сперва
 * проверит, что она действительно пуста.
 */
export const DEAL_INIT_JOB_ATTEMPTS = 1;

/**
 * Один и тот же jobId на сделку — ключ дедупликации.
 *
 * Битрикс шлёт вебхук несколько раз подряд, не дожидаясь ответа. Без
 * общего ключа каждый запрос завёл бы свою задачу, и заявка обработалась
 * бы столько раз, сколько пришло вебхуков: задвоенные участники, гонка
 * за номер, перезаписанные товары.
 */
export const getDealInitJobId = (dealId: number | string): string =>
    `deal-init:${Number(dealId)}`;

/**
 * Кто поставил заявку в очередь.
 *
 * Нужно в логах: вебхук портала доходит с задержкой от секунд до минут
 * (сделка 204296, 17.11.2026 — 7 минут), и сделку успевает забрать крон
 * подхвата. Без источника в логе не ответить, кто пришёл первым и нужен
 * ли вообще крон на такой частоте
 */
export enum DealInitSource {
    /** Вебхук бизнес-процесса #828 */
    HOOK = 'hook',
    /** Крон подхвата недошедших заявок */
    RECOVERY = 'recovery',
}

/** Заявка из вебхука: домен нужен, чтобы знать, в какой портал ходить */
export interface DealInitJobData {
    dealId: number;
    domain: string;
    source?: DealInitSource;
    /** Сколько раз крон уже оживлял эту сделку после падения */
    retries?: number;
    /** Крон сдался и сообщил об этом — повторно не шумим */
    gaveUp?: boolean;
}

/**
 * Через сколько после падения задачу можно ставить заново.
 *
 * Для вебхука коротко: если сотрудник перепнул заявку вручную, ждать пять
 * минут незачем. Для крона длиннее — он идёт каждые три минуты и без
 * паузы молотил бы по порталу, который, возможно, всё ещё лежит
 */
export const getFailedCooldownMs = (source?: DealInitSource): number =>
    source === DealInitSource.RECOVERY ? 5 * 60 * 1000 : 60 * 1000;

/**
 * Сколько раз крон оживляет одну сделку, прежде чем сдаться.
 *
 * Без предела сделка, которую приём не может принять никогда (битые
 * данные, ошибка в коде), крутилась бы вечно и каждый раз забивала канал
 */
export const DEAL_INIT_MAX_RECOVERIES = 5;

/** Что известно о задаче с тем же jobId, которая уже есть в очереди */
export interface ExistingDealInitJob {
    state: string;
    /** Когда задача закончилась (мс), если закончилась */
    finishedOn?: number | null;
    retries?: number | null;
}

export type DealInitEnqueueAction =
    /** задачи нет — ставим */
    | 'add'
    /** задача в работе или только что закончилась — не трогаем */
    | 'skip'
    /** старая задача упала или давно закончилась — убираем и ставим заново */
    | 'revive'
    /** крон перепробовал достаточно, дальше — только человек */
    | 'give-up';

/**
 * Решает, что делать, когда сделку просят принять, а задача с её jobId
 * уже есть.
 *
 * Bull при существующем jobId не добавляет ничего — в каком бы состоянии
 * старая задача ни была. А у нас упавшие задачи не удаляются
 * (removeOnFail: false), и первая же пятисотка портала навсегда закрывала
 * сделку от повторного приёма. 20.11.2026 так застряли четыре заявки:
 * крон каждые три минуты «ставил их в очередь», Bull молча отказывал, а
 * сделки так и стояли пустыми.
 */
export const decideDealInitEnqueue = (
    existing: ExistingDealInitJob | null | undefined,
    now: number,
    source: DealInitSource = DealInitSource.HOOK,
): DealInitEnqueueAction => {
    if (!existing) return 'add';

    const finishedAgo = existing.finishedOn
        ? now - existing.finishedOn
        : Number.POSITIVE_INFINITY;
    const exhausted =
        source === DealInitSource.RECOVERY &&
        (existing.retries ?? 0) >= DEAL_INIT_MAX_RECOVERIES;

    switch (existing.state) {
        case 'failed':
            if (finishedAgo < getFailedCooldownMs(source)) return 'skip';
            return exhausted ? 'give-up' : 'revive';

        case 'completed':
            //окно дедупликации: пачка вебхуков по одной сделке схлопывается
            if (finishedAgo < DEAL_INIT_JOB_KEEP_MS) return 'skip';
            //закончилась давно, а сделка опять просит приёма — значит
            //человек перепнул её или приём не дошёл до признака
            return exhausted ? 'give-up' : 'revive';

        default:
            //active, waiting, delayed, paused — уже в работе
            return 'skip';
    }
};

/**
 * Данные задачи из тела вебхука. Возвращает null, если принять нечего —
 * контроллер в этом случае отвечает отказом, а не кладёт мусор в очередь.
 */
export const toDealInitJobData = (
    dealId: unknown,
    domain: unknown,
    source: DealInitSource = DealInitSource.HOOK,
): DealInitJobData | null => {
    const id = Number(dealId);
    if (!Number.isInteger(id) || id <= 0) return null;

    const host = typeof domain === 'string' ? domain.trim() : '';
    if (!host) return null;

    return { dealId: id, domain: host, source };
};

/** Человекочитаемый источник для логов */
export const getSourceLabel = (source?: DealInitSource): string =>
    source === DealInitSource.RECOVERY ? 'крон подхвата' : 'вебхук БП';
