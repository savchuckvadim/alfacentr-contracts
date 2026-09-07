import {
    addDaysToProjectDate,
    getProjectDate,
    PROJECT_TIME_ZONE,
} from './project-time.util';

describe('PROJECT_TIME_ZONE', () => {
    it('проект живет по Новосибирску', () => {
        expect(PROJECT_TIME_ZONE).toBe('Asia/Novosibirsk');
    });
});

describe('getProjectDate', () => {
    //моменты задаем в UTC: тест не должен зависеть от пояса машины,
    //на которой его запускают
    it('день по Новосибирску, когда в UTC еще предыдущие сутки', () => {
        //21 августа 17:30 UTC — это уже 22 августа 00:30 в Новосибирске
        expect(getProjectDate(new Date('2026-08-21T17:30:00Z'))).toBe(
            '2026-08-22',
        );
    });

    it('за час до полуночи по Новосибирску дата еще прежняя', () => {
        expect(getProjectDate(new Date('2026-08-21T16:30:00Z'))).toBe(
            '2026-08-21',
        );
    });

    it('месяц и день дополняются нулями', () => {
        expect(getProjectDate(new Date('2026-01-05T03:00:00Z'))).toBe(
            '2026-01-05',
        );
    });

    it('переход через границу года считается верно', () => {
        //31 декабря 17:00 UTC — уже 1 января в Новосибирске
        expect(getProjectDate(new Date('2026-12-31T17:00:00Z'))).toBe(
            '2027-01-01',
        );
    });
});

describe('addDaysToProjectDate', () => {
    it('прибавляет дни', () => {
        expect(addDaysToProjectDate('2026-08-21', 14)).toBe('2026-09-04');
    });

    it('переходит через границу месяца', () => {
        expect(addDaysToProjectDate('2026-08-31', 1)).toBe('2026-09-01');
    });

    it('переходит через границу года', () => {
        expect(addDaysToProjectDate('2026-12-25', 10)).toBe('2027-01-04');
    });

    it('нулевой сдвиг оставляет дату как есть', () => {
        expect(addDaysToProjectDate('2026-08-21', 0)).toBe('2026-08-21');
    });

    it('битую дату отдает без изменений', () => {
        expect(addDaysToProjectDate('не дата', 5)).toBe('не дата');
    });
});
