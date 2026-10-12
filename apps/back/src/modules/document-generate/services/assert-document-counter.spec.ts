import {
    DocumentCounterMissingError,
    assertDocumentCounter,
    isValidDocumentCounter,
} from './assert-document-counter.util';

describe('isValidDocumentCounter', () => {
    it('обычный номер годится', () => {
        expect(isValidDocumentCounter('28')).toBe(true);
        expect(isValidDocumentCounter(28)).toBe(true);
    });

    it('единица годится: это настоящий первый номер по префиксу', () => {
        expect(isValidDocumentCounter('1')).toBe(true);
    });

    it('пробелы вокруг номера не мешают', () => {
        expect(isValidDocumentCounter(' 28 ')).toBe(true);
    });

    it('«0» не годится — это незаполненный стейт фронта, а не номер', () => {
        //именно этот случай уронил генерацию по сделке 198090
        expect(isValidDocumentCounter('0')).toBe(false);
        expect(isValidDocumentCounter(0)).toBe(false);
    });

    it('пустое значение не годится', () => {
        expect(isValidDocumentCounter('')).toBe(false);
        expect(isValidDocumentCounter('   ')).toBe(false);
        expect(isValidDocumentCounter(undefined)).toBe(false);
        expect(isValidDocumentCounter(null)).toBe(false);
    });

    it('нечисловое значение не годится', () => {
        expect(isValidDocumentCounter('abc')).toBe(false);
        expect(isValidDocumentCounter('28a')).toBe(false);
        expect(isValidDocumentCounter('-5')).toBe(false);
        expect(isValidDocumentCounter('1.5')).toBe(false);
        expect(isValidDocumentCounter({})).toBe(false);
        expect(isValidDocumentCounter(['28'])).toBe(false);
    });
});

describe('assertDocumentCounter', () => {
    it('с годным номером пропускает дальше', () => {
        expect(() => assertDocumentCounter('28', 198090)).not.toThrow();
    });

    it('с нулём останавливает генерацию', () => {
        expect(() => assertDocumentCounter('0', 198090)).toThrow(
            DocumentCounterMissingError,
        );
    });

    it('в тексте ошибки есть номер сделки и само значение', () => {
        //без номера сделки такие случаи приходится искать вручную
        //по всему порталу: прежнее сообщение в Telegram его не содержало
        try {
            assertDocumentCounter('0', 198090);
            fail('ожидалась ошибка');
        } catch (error) {
            const message = (error as Error).message;
            expect(message).toContain('198090');
            expect(message).toContain('"0"');
        }
    });

    it('пустой номер тоже останавливает', () => {
        expect(() => assertDocumentCounter('', 1)).toThrow(
            DocumentCounterMissingError,
        );
    });
});
