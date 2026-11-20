import {
    DEAL_INIT_JOB_KEEP_MS,
    DEAL_INIT_MAX_RECOVERIES,
    DealInitSource,
    decideDealInitEnqueue,
    getDealInitJobId,
    getFailedCooldownMs,
    toDealInitJobData,
} from './deal-init-job.rules';

/**
 * Дедупликация приёма заявки. 16.11.2026 Битрикс прислал пять вебхуков по
 * сделке 204098 за десять секунд, и каждый запускал полный приём: товары
 * ставились заменой состава, участники добавлялись заново.
 */
describe('getDealInitJobId', () => {
    it('одна сделка — один ключ, сколько бы вебхуков ни пришло', () => {
        expect(getDealInitJobId(204098)).toBe(getDealInitJobId(204098));
    });

    it('строка и число дают один ключ: dealId приходит из параметра пути', () => {
        expect(getDealInitJobId('204098')).toBe(getDealInitJobId(204098));
    });

    it('разные сделки не схлопываются', () => {
        expect(getDealInitJobId(204098)).not.toBe(getDealInitJobId(204080));
    });
});

describe('toDealInitJobData', () => {
    const domain = 'alfacentr.bitrix24.ru';

    it('нормальный вебхук принимается', () => {
        expect(toDealInitJobData('204098', domain)).toEqual({
            dealId: 204098,
            domain,
            source: DealInitSource.HOOK,
        });
    });

    it('источник по умолчанию — вебхук, крон передаёт свой', () => {
        expect(toDealInitJobData(204098, domain)?.source).toBe(
            DealInitSource.HOOK,
        );
        expect(
            toDealInitJobData(204098, domain, DealInitSource.RECOVERY)?.source,
        ).toBe(DealInitSource.RECOVERY);
    });

    it('пробелы вокруг домена срезаются', () => {
        expect(toDealInitJobData(204098, `  ${domain} `)?.domain).toBe(domain);
    });

    it('без домена не принимаем: неизвестно, в какой портал идти', () => {
        expect(toDealInitJobData(204098, '')).toBeNull();
        expect(toDealInitJobData(204098, '   ')).toBeNull();
        expect(toDealInitJobData(204098, undefined)).toBeNull();
    });

    it('негодный номер сделки не принимаем', () => {
        expect(toDealInitJobData('не число', domain)).toBeNull();
        expect(toDealInitJobData(0, domain)).toBeNull();
        expect(toDealInitJobData(-5, domain)).toBeNull();
        expect(toDealInitJobData(1.5, domain)).toBeNull();
        expect(toDealInitJobData(undefined, domain)).toBeNull();
    });
});

/**
 * 20.11.2026 четыре заявки застряли пустыми: приём упал на пятисотке
 * портала, упавшая задача осталась в Redis (removeOnFail: false), а Bull
 * при существующем jobId молча ничего не добавляет. Крон каждые три минуты
 * «ставил в очередь» те же сделки и отчитывался об успехе.
 */
describe('decideDealInitEnqueue', () => {
    const now = 1_700_000_000_000;
    const minutesAgo = (n: number) => now - n * 60 * 1000;

    it('задачи нет — ставим', () => {
        expect(decideDealInitEnqueue(null, now)).toBe('add');
        expect(decideDealInitEnqueue(undefined, now)).toBe('add');
    });

    it('задача в работе — не трогаем, в каком бы виде ни была', () => {
        for (const state of ['active', 'waiting', 'delayed', 'paused']) {
            expect(decideDealInitEnqueue({ state }, now)).toBe('skip');
        }
    });

    it('упавшая давно — оживляем: именно это и застряло 20.11.2026', () => {
        expect(
            decideDealInitEnqueue(
                { state: 'failed', finishedOn: minutesAgo(120), retries: 0 },
                now,
                DealInitSource.RECOVERY,
            ),
        ).toBe('revive');
    });

    it('упавшая только что — даём порталу отдышаться', () => {
        expect(
            decideDealInitEnqueue(
                { state: 'failed', finishedOn: minutesAgo(1) },
                now,
                DealInitSource.RECOVERY,
            ),
        ).toBe('skip');
    });

    it('вебхуку, то есть человеку, ждать меньше, чем крону', () => {
        expect(getFailedCooldownMs(DealInitSource.HOOK)).toBeLessThan(
            getFailedCooldownMs(DealInitSource.RECOVERY),
        );

        //две минуты назад: крон ещё ждёт, а перепнутая вручную заявка нет
        const failedTwoMinutesAgo = {
            state: 'failed',
            finishedOn: minutesAgo(2),
        };
        expect(
            decideDealInitEnqueue(failedTwoMinutesAgo, now, DealInitSource.HOOK),
        ).toBe('revive');
        expect(
            decideDealInitEnqueue(
                failedTwoMinutesAgo,
                now,
                DealInitSource.RECOVERY,
            ),
        ).toBe('skip');
    });

    it('крон сдаётся после предела, а не крутит сделку вечно', () => {
        const exhausted = {
            state: 'failed',
            finishedOn: minutesAgo(60),
            retries: DEAL_INIT_MAX_RECOVERIES,
        };

        expect(
            decideDealInitEnqueue(exhausted, now, DealInitSource.RECOVERY),
        ).toBe('give-up');
    });

    it('предел относится только к крону: человеку отказывать нельзя', () => {
        expect(
            decideDealInitEnqueue(
                {
                    state: 'failed',
                    finishedOn: minutesAgo(60),
                    retries: DEAL_INIT_MAX_RECOVERIES + 3,
                },
                now,
                DealInitSource.HOOK,
            ),
        ).toBe('revive');
    });

    it('только что отработавшая задача схлопывает пачку вебхуков', () => {
        const justDone = {
            state: 'completed',
            finishedOn: now - DEAL_INIT_JOB_KEEP_MS / 2,
        };

        expect(decideDealInitEnqueue(justDone, now)).toBe('skip');
    });

    it('давно отработавшая не должна закрывать сделку навсегда', () => {
        //Bull чистит завершённые лениво, при завершении других задач: в
        //тихую ночь старая задача лежала бы и отбрасывала перепинок
        expect(
            decideDealInitEnqueue(
                {
                    state: 'completed',
                    finishedOn: now - DEAL_INIT_JOB_KEEP_MS * 3,
                },
                now,
            ),
        ).toBe('revive');
    });

    it('упавшая без отметки времени — считаем давней, а не навсегда свежей', () => {
        expect(
            decideDealInitEnqueue({ state: 'failed' }, now, DealInitSource.HOOK),
        ).toBe('revive');
    });
});
