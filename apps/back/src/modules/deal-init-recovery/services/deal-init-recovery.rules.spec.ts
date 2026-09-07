import {
    getRecoveryWindow,
    isRecoveryCandidate,
    RECOVERY_MAX_AGE_DAYS,
    RECOVERY_MIN_AGE_MINUTES,
    RECOVERY_NOT_BEFORE,
    RecoveryCandidate,
    SEMINAR_DEAL_CATEGORY_ID,
    SEMINAR_DEAL_NEW_STAGE_ID,
} from './deal-init-recovery.rules';

//заведомо позже выката признака: глубина в 7 дней целиком после него
const NOW = new Date('2026-09-21T12:00:00Z');
const minutesAgo = (m: number, base: Date = NOW) =>
    new Date(base.getTime() - m * 60 * 1000).toISOString();
const daysAgo = (d: number, base: Date = NOW) =>
    new Date(base.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

const candidate = (
    over: Partial<RecoveryCandidate> = {},
): RecoveryCandidate => ({
    id: 1,
    stageId: SEMINAR_DEAL_NEW_STAGE_ID,
    categoryId: SEMINAR_DEAL_CATEGORY_ID,
    dateCreate: minutesAgo(60),
    processedAt: null,
    ...over,
});

describe('getRecoveryWindow', () => {
    it('окно: от N дней назад до N минут назад', () => {
        const { from, to } = getRecoveryWindow(NOW);
        expect(to.toISOString()).toBe(minutesAgo(RECOVERY_MIN_AGE_MINUTES));
        expect(from.toISOString()).toBe(daysAgo(RECOVERY_MAX_AGE_DAYS));
    });

    it('границы настраиваются', () => {
        const { from, to } = getRecoveryWindow(NOW, 5, 1);
        expect(to.toISOString()).toBe(minutesAgo(5));
        expect(from.toISOString()).toBe(daysAgo(1));
    });

    it('глубина не уходит раньше выката признака', () => {
        //через два дня после выката: 7 дней назад — это еще до признака
        const soonAfterRollout = new Date(
            RECOVERY_NOT_BEFORE.getTime() + 2 * 24 * 60 * 60 * 1000,
        );
        const { from } = getRecoveryWindow(soonAfterRollout);
        expect(from.toISOString()).toBe(RECOVERY_NOT_BEFORE.toISOString());
    });
});

describe('isRecoveryCandidate', () => {
    it('подходящая сделка: воронка 26, стадия Заявка, без признака, в окне', () => {
        expect(isRecoveryCandidate(candidate(), NOW)).toBe(true);
    });

    it('чужая воронка не трогается', () => {
        expect(isRecoveryCandidate(candidate({ categoryId: 8 }), NOW)).toBe(
            false,
        );
    });

    it('сделка ушла дальше Заявки: ею уже занимался человек', () => {
        expect(
            isRecoveryCandidate(candidate({ stageId: 'C26:PREPARATION' }), NOW),
        ).toBe(false);
        expect(
            isRecoveryCandidate(candidate({ stageId: 'C26:EXECUTING' }), NOW),
        ).toBe(false);
    });

    it('признак обработки стоит: до конца уже дошли', () => {
        expect(
            isRecoveryCandidate(
                candidate({ processedAt: '2026-09-21T10:00:00+03:00' }),
                NOW,
            ),
        ).toBe(false);
    });

    it('слишком свежая: вебхук может выполняться прямо сейчас', () => {
        expect(
            isRecoveryCandidate(candidate({ dateCreate: minutesAgo(5) }), NOW),
        ).toBe(false);
    });

    it('ровно на границе по свежести берется', () => {
        expect(
            isRecoveryCandidate(
                candidate({ dateCreate: minutesAgo(RECOVERY_MIN_AGE_MINUTES) }),
                NOW,
            ),
        ).toBe(true);
    });

    it('старше глубины не воскрешается', () => {
        expect(
            isRecoveryCandidate(candidate({ dateCreate: daysAgo(8) }), NOW),
        ).toBe(false);
    });

    it('ровно на границе глубины берется', () => {
        expect(
            isRecoveryCandidate(
                candidate({ dateCreate: daysAgo(RECOVERY_MAX_AGE_DAYS) }),
                NOW,
            ),
        ).toBe(true);
    });

    it('созданная до выката признака не трогается, даже если в окне 7 дней', () => {
        const soonAfterRollout = new Date(
            RECOVERY_NOT_BEFORE.getTime() + 2 * 24 * 60 * 60 * 1000,
        );
        expect(
            isRecoveryCandidate(
                candidate({ dateCreate: daysAgo(3, soonAfterRollout) }),
                soonAfterRollout,
            ),
        ).toBe(false);
        expect(
            isRecoveryCandidate(
                candidate({ dateCreate: daysAgo(1, soonAfterRollout) }),
                soonAfterRollout,
            ),
        ).toBe(true);
    });

    it('битая дата создания не берется', () => {
        expect(
            isRecoveryCandidate(candidate({ dateCreate: 'не дата' }), NOW),
        ).toBe(false);
    });

    it('категория строкой из портала тоже распознается', () => {
        expect(isRecoveryCandidate(candidate({ categoryId: '26' }), NOW)).toBe(
            true,
        );
    });
});
