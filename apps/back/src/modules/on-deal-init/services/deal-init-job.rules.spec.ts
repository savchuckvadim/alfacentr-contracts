import {
    DealInitSource,
    getDealInitJobId,
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
