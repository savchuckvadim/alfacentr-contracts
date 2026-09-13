import { ProductType } from './product.type';


// Семинар - это С, все после С - принадлежность к отделу, дате и месту проведения
// ППК - ППК, он к счастью всю жизнь такой
// УП Видеозапись - УВ
// УП Комплектом - УП
// Спецпродукт (УП Семинаром) - УС (это точно не будут изменять)
// В товарах основная часть префикса именно эта, остальное - принадлежность к продающему отделу (Р\Н\З), у ППК, УП, УВ отличаются только эти буквы и цифры, указывающие на год курсов ППК и УП , т.е. в 2026 году у всех например УПН26\ППКН26, вне зависимости от других параметров товара (часы обучения\тип учреждения). У семинаров у всех разные префиксы, т.к. их составляют из отдела + дата + город после буквы С.
// Спецпродукту присвоено УС, после этого только отдел и год, на скрине пример, что УС для здравоохранения и др. учреждений он одинаковый УСР.
// Если возможно разделить понимание, что УСР и СР это разное, то нужно конечно, чтобы спецпродукт не проскочил как семинар, поскольку у них совершенно разные договоры. В остальном другие кейсы не встречались

const seminarPrixPart = 'С';
const ppkPrixPart = 'ППК';
const upVideoPrixPart = 'УВ';
const upComplectPrixPart = 'УП';
const upSpecialPrixPart = 'УС';
// const upSpecialPrixPartSecond = 'УВР';
export const getProductTypeByProductName = (
    productName: string,
): ProductType => {
    const prefix = getPrefixByProductName(productName);

    if (prefix.includes(seminarPrixPart)
        && !prefix.includes(ppkPrixPart)
        && !prefix.includes(upVideoPrixPart)
        && !prefix.includes(upComplectPrixPart)
        && !prefix.includes(upSpecialPrixPart)
        // && !prefix.includes(upSpecialPrixPartSecond)
    ) {
        return 'seminar';
    } else if (prefix.includes(ppkPrixPart)) {
        return 'ppk';
    } else if (
        prefix.includes(upVideoPrixPart)
        // && !prefix.includes(upSpecialPrixPartSecond)
    ) {
        return 'up_video';
    } else if (prefix.includes(upComplectPrixPart)) {
        return 'up_complect';
    } else if (
        prefix.includes(upSpecialPrixPart)
        // || prefix.includes(upSpecialPrixPartSecond)
    ) {
        return 'up_special';
    }
    return 'seminar';
};


//old version оставил пока на всякий случай для отлавливания багов
// export const getProductTypeByProductName = (
//     productName: string,
// ): ProductType => {
//     const prefix = getPrefixByProductName(productName);

//     if (prefix.includes('СР') || prefix.includes('СН')) {
//         return 'seminar' as ProductType;
//     } else if (prefix.includes('ППК')) {
//         return 'ppk' as ProductType;
//     } else {
//         return 'up' as ProductType;
//     }
// };

/**
 * Нормализует префикс: убирает невидимый мусор из названий товаров.
 *
 * Без этого «СЗ2309СП » и «СЗ2309СП» — два разных префикса: заводится второй
 * счётчик, а сравнение с префиксом в сделке никогда не совпадает, и номер
 * перевыдаётся при каждом открытии карточки.
 *
 * Коды символов заданы числами намеренно: escape-последовательности в
 * регулярках слишком легко превратить в сами невидимые символы при правках.
 */
export function normalizePrefix(raw: string | undefined | null): string {
    const ZERO_WIDTH_FROM = 0x200b;
    const ZERO_WIDTH_TO = 0x200f;
    const BIDI_FROM = 0x202a;
    const BIDI_TO = 0x202e;
    const BOM = 0xfeff;
    const NBSP = 0x00a0;

    return Array.from(String(raw ?? '').normalize('NFC'))
        .filter(char => {
            const code = char.codePointAt(0) as number;
            if (code >= ZERO_WIDTH_FROM && code <= ZERO_WIDTH_TO) return false;
            if (code >= BIDI_FROM && code <= BIDI_TO) return false;
            return code !== BOM;
        })
        .map(char => (char.codePointAt(0) === NBSP ? ' ' : char))
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Префикс — это всё, что стоит после «[]» в названии товара */
export function getPrefixByProductName(productName: string): string {
    const match = productName.match(/\[\]\s*(.*)/);
    return match ? normalizePrefix(match[1] as string) : '';
}
