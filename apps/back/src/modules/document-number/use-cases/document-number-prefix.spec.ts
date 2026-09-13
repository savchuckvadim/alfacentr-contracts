import { getPrefixByProductName, normalizePrefix } from '@alfa/entities';

/**
 * Нумерация договоров держится на том, что один и тот же префикс всегда даёт
 * одну и ту же строку. Любое расхождение заводит второй счётчик в списке 46 и
 * две независимые нумерации от единицы.
 */
describe('normalizePrefix', () => {
    const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);
    const NBSP = String.fromCharCode(0x00a0);
    const BOM = String.fromCharCode(0xfeff);

    it('оставляет чистый префикс без изменений', () => {
        expect(normalizePrefix('СЗ2309СП')).toBe('СЗ2309СП');
    });

    it('срезает пробелы по краям', () => {
        expect(normalizePrefix('СЗ2309СП ')).toBe('СЗ2309СП');
        expect(normalizePrefix(' УПН24')).toBe('УПН24');
        expect(normalizePrefix('  ППК  ')).toBe('ППК');
    });

    it('схлопывает двойные пробелы', () => {
        expect(normalizePrefix('ТЕСТ  ППКР25')).toBe('ТЕСТ ППКР25');
    });

    it('убирает символы нулевой ширины и BOM', () => {
        expect(normalizePrefix(`СЗ1212К${ZERO_WIDTH_SPACE}`)).toBe('СЗ1212К');
        expect(normalizePrefix(`${BOM}УВЗ26`)).toBe('УВЗ26');
    });

    it('превращает неразрывный пробел в обычный', () => {
        expect(normalizePrefix(`УП${NBSP}Н24`)).toBe('УП Н24');
    });

    it('не трогает дефисы внутри префикса', () => {
        expect(normalizePrefix('СР-2409-К')).toBe('СР-2409-К');
    });

    it('не путает кириллицу с латиницей', () => {
        // Латинская C вместо кириллической С — это другой префикс, и
        // нормализация не должна их склеивать молча.
        expect(normalizePrefix('C32309CП')).not.toBe(
            normalizePrefix('СЗ2309СП'),
        );
    });

    it('переваривает пустые значения', () => {
        expect(normalizePrefix('')).toBe('');
        expect(normalizePrefix(undefined)).toBe('');
        expect(normalizePrefix(null)).toBe('');
    });
});

describe('getPrefixByProductName', () => {
    it('берёт всё после [] и нормализует', () => {
        expect(
            getPrefixByProductName(
                'Семинар РАЗРЕЗОВА 23-24 сентября Санкт-Петербург []СЗ2309СП',
            ),
        ).toBe('СЗ2309СП');
    });

    it('срезает хвостовой пробел из названия товара', () => {
        expect(getPrefixByProductName('ППК Код В 120ч []ППКЗ26 ')).toBe(
            'ППКЗ26',
        );
    });

    it('возвращает пустую строку, если маркера [] нет', () => {
        expect(getPrefixByProductName('Семинар без префикса')).toBe('');
    });
});
