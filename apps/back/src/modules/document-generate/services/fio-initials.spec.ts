import { getInitialsByFullName, splitFullName } from '@alfa/entities';

/**
 * Подпись клиента в договоре: «Иванов А. А.».
 *
 * Клиентский случай 02.11.2026: в договорах подпись печаталась обрезанной,
 * «Иванов А.» вместо «Иванов А. А.». Причина — правка от 21.04.2026, которая
 * оставляла только один инициал. Логика жила приватным методом во фронте, где
 * тестов нет, поэтому ошибка держалась полгода. Тест закрепляет формат.
 */
describe('getInitialsByFullName', () => {
    it('полное ФИО даёт фамилию и два инициала', () => {
        expect(getInitialsByFullName('Иванов Алексей Петрович')).toBe(
            'Иванов А. П.',
        );
    });

    it('без отчества — один инициал и без лишней точки', () => {
        expect(getInitialsByFullName('Иванов Алексей')).toBe('Иванов А.');
    });

    it('одна фамилия остаётся сама собой', () => {
        expect(getInitialsByFullName('Иванов')).toBe('Иванов');
    });

    it('лишние пробелы не ломают разбор', () => {
        expect(getInitialsByFullName('  Иванов   Алексей   Петрович ')).toBe(
            'Иванов А. П.',
        );
    });

    it('инициалы приводятся к верхнему регистру', () => {
        expect(getInitialsByFullName('иванов алексей петрович')).toBe(
            'иванов А. П.',
        );
    });

    it('четвёртое слово в ФИО игнорируется', () => {
        expect(getInitialsByFullName('Иванов Алексей Петрович Лишний')).toBe(
            'Иванов А. П.',
        );
    });

    it('пустое значение даёт пустую строку, а не точки', () => {
        expect(getInitialsByFullName('')).toBe('');
        expect(getInitialsByFullName('   ')).toBe('');
        expect(getInitialsByFullName(null)).toBe('');
        expect(getInitialsByFullName(undefined)).toBe('');
    });

    it('нестроковое значение не роняет подпись', () => {
        expect(getInitialsByFullName(42)).toBe('');
        expect(getInitialsByFullName({})).toBe('');
    });
});

describe('splitFullName', () => {
    it('раскладывает ФИО по частям', () => {
        expect(splitFullName('Иванов Алексей Петрович')).toEqual({
            last: 'Иванов',
            first: 'Алексей',
            middle: 'Петрович',
        });
    });

    it('отсутствующие части — null, а не пустые строки', () => {
        expect(splitFullName('Иванов')).toEqual({
            last: 'Иванов',
            first: null,
            middle: null,
        });
    });
});
