import {
    isConfirmThresholdReached,
    PPK_CONFIRM_DAYS_BEFORE,
} from './ppk-schedule.service';

describe('isConfirmThresholdReached', () => {
    const today = '2026-08-21';

    it('ровно за две недели до начала — порог наступил', () => {
        expect(isConfirmThresholdReached('2026-09-04', today)).toBe(true);
    });

    it('за день до порога — еще рано', () => {
        expect(isConfirmThresholdReached('2026-09-05', today)).toBe(false);
    });

    it('мероприятие завтра — порог наступил', () => {
        expect(isConfirmThresholdReached('2026-08-22', today)).toBe(true);
    });

    it('мероприятие сегодня — порог наступил', () => {
        expect(isConfirmThresholdReached(today, today)).toBe(true);
    });

    it('дата в прошлом порог не запускает', () => {
        expect(isConfirmThresholdReached('2026-08-01', today)).toBe(false);
    });

    it('пустая дата порог не запускает', () => {
        expect(isConfirmThresholdReached('', today)).toBe(false);
    });

    it('переход через границу месяца считается верно', () => {
        //до 14 сентября от 31 августа — 14 дней ровно
        expect(isConfirmThresholdReached('2026-09-14', '2026-08-31')).toBe(true);
        expect(isConfirmThresholdReached('2026-09-15', '2026-08-31')).toBe(
            false,
        );
    });

    it('порог настраивается', () => {
        expect(isConfirmThresholdReached('2026-08-25', today, 3)).toBe(false);
        expect(isConfirmThresholdReached('2026-08-24', today, 3)).toBe(true);
    });

    it('по умолчанию порог равен двум неделям', () => {
        expect(PPK_CONFIRM_DAYS_BEFORE).toBe(14);
    });
});
