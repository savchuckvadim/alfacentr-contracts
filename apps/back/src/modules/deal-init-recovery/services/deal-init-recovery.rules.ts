/**
 * Правила отбора сделок для подхвата. Без обращений к порталу и без
 * импортов с алиасами — чтобы их можно было гонять в jest как чистые функции
 */

/** Воронка семинаров — чужие воронки не трогаем */
export const SEMINAR_DEAL_CATEGORY_ID = 26;
/** Стадия, на которой сделка ждет обработки заявки */
export const SEMINAR_DEAL_NEW_STAGE_ID = 'C26:NEW';
/** Не гонимся за вебхуком, который выполняется прямо сейчас */
export const RECOVERY_MIN_AGE_MINUTES = 15;
/** Старое не воскрешаем */
export const RECOVERY_MAX_AGE_DAYS = 7;
/**
 * Дата выката признака обработки. Сделки, созданные раньше, приняты без него,
 * и по пустоте их не отличить от недошедших (у УП-заявок товаров и участников
 * нет в норме). Повторный прием задвоил бы таймлайн и поиск компании —
 * поэтому все, что старше этой даты, не трогаем вовсе
 */
export const RECOVERY_NOT_BEFORE = new Date('2026-09-08T00:00:00+03:00');
/**
 * Ограничение на прогон: после долгого простоя сервера кандидатов может быть
 * много, а прием одной заявки идет секунды. Остальное подхватит следующий запуск
 */
export const RECOVERY_BATCH_LIMIT = 20;

export interface RecoveryCandidate {
    id: number;
    stageId: string;
    categoryId: number | string;
    dateCreate: string;
    processedAt?: string | null;
}

/**
 * Окно дат для отбора: от maxAgeDays назад (но не раньше выката признака)
 * до minAgeMinutes назад
 */
export const getRecoveryWindow = (
    now: Date,
    minAgeMinutes: number = RECOVERY_MIN_AGE_MINUTES,
    maxAgeDays: number = RECOVERY_MAX_AGE_DAYS,
    notBefore: Date = RECOVERY_NOT_BEFORE,
): { from: Date; to: Date } => {
    const to = new Date(now.getTime() - minAgeMinutes * 60 * 1000);
    const depth = new Date(now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000);
    const from = depth > notBefore ? depth : new Date(notBefore.getTime());
    return { from, to };
};

/** Подходит ли сделка под подхват — проверка только по данным самой сделки */
export const isRecoveryCandidate = (
    deal: RecoveryCandidate,
    now: Date,
): boolean => {
    if (Number(deal.categoryId) !== SEMINAR_DEAL_CATEGORY_ID) return false;
    if (deal.stageId !== SEMINAR_DEAL_NEW_STAGE_ID) return false;
    if (deal.processedAt) return false;

    const created = new Date(deal.dateCreate);
    if (Number.isNaN(created.getTime())) return false;

    const { from, to } = getRecoveryWindow(now);
    return created >= from && created <= to;
};
