import { normalizeEmail, normalizePhone } from '@alfa/entities';

/**
 * Телефон — свободная строка: формат не проверяется, а чистка не должна
 * склеивать добавочные и списки номеров. Тест закрепляет это решение, чтобы
 * «вырезать все пробелы» не вернулось вместе с очередной правкой копипаста.
 */
describe('normalizePhone', () => {
    const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);
    const SOFT_HYPHEN = String.fromCharCode(0x00ad);
    const NBSP = String.fromCharCode(0x00a0);
    const BOM = String.fromCharCode(0xfeff);

    it('оставляет обычный номер без изменений', () => {
        expect(normalizePhone('+73831234567')).toBe('+73831234567');
        expect(normalizePhone('8 (383) 123-45-67')).toBe('8 (383) 123-45-67');
    });

    it('сохраняет добавочный номер с пробелом', () => {
        expect(normalizePhone('+73831234567 доб 123')).toBe(
            '+73831234567 доб 123',
        );
    });

    it('сохраняет несколько номеров через запятую', () => {
        expect(
            normalizePhone('+7 (383) 123-45-67, +7 913 000 00 00'),
        ).toBe('+7 (383) 123-45-67, +7 913 000 00 00');
    });

    it('сводит неразрывные пробелы, табуляции и переносы к одному пробелу', () => {
        expect(normalizePhone(`+7${NBSP}383\n123\t45`)).toBe('+7 383 123 45');
        expect(normalizePhone('+7    383   доб   1')).toBe('+7 383 доб 1');
    });

    it('срезает пробелы по краям', () => {
        expect(normalizePhone('  +7 383 123  ')).toBe('+7 383 123');
        expect(normalizePhone('\n+7 383\n')).toBe('+7 383');
    });

    it('убирает невидимые символы, не трогая пробелы', () => {
        expect(normalizePhone(`+7${ZERO_WIDTH_SPACE}383 доб${SOFT_HYPHEN} 1`)).toBe(
            '+7383 доб 1',
        );
        expect(normalizePhone(`${BOM}+7 383`)).toBe('+7 383');
    });

    it('пустое и отсутствующее значение даёт пустую строку', () => {
        expect(normalizePhone('')).toBe('');
        expect(normalizePhone('   ')).toBe('');
        expect(normalizePhone(null)).toBe('');
        expect(normalizePhone(undefined)).toBe('');
    });
});

describe('normalizeEmail', () => {
    const NBSP = String.fromCharCode(0x00a0);
    const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);

    it('по-прежнему режет все пробелы и невидимые символы', () => {
        expect(normalizeEmail(' a@b.c ')).toBe('a@b.c');
        expect(normalizeEmail(`a${NBSP}@b.c`)).toBe('a@b.c');
        expect(normalizeEmail(`a@b${ZERO_WIDTH_SPACE}.c\n`)).toBe('a@b.c');
    });
});
