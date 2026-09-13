/**
 * Нормализация контактных значений: email и телефон.
 *
 * Живёт в пакете сущностей, а не в модулях фронта, намеренно. Этим пользуется
 * и модельный слой участников, и интерфейс, и бэкенд. Если функция лежит в
 * модулях фронта, модельный слой обязан тянуть её через слой интерфейса — и
 * замыкается цикл импортов: слайс, санки и хелпер склеиваются в одну область
 * видимости, а фронт падает с «Cannot access before initialization».
 *
 * Коды символов заданы числами, а не escape-последовательностями: последние
 * слишком легко превратить в сами невидимые символы при правке файла.
 */

/** Мягкий перенос, zero-width space, non-joiner, joiner, BOM */
const INVISIBLE_CODES = new Set([0x00ad, 0x200b, 0x200c, 0x200d, 0xfeff]);

/**
 * Убирает невидимый мусор и все пробелы.
 *
 * Пробелы режутся целиком, а не только по краям: в email их не бывает, а в
 * телефоне они не значат ничего. Значения прилетают копипастом из писем, word
 * и мессенджеров, и вместе с ними — неразрывные пробелы и переносы строк.
 */
export const stripInvisible = (value: string | undefined | null): string =>
    Array.from(String(value ?? ''))
        .filter(char => {
            const code = char.codePointAt(0) as number;
            if (INVISIBLE_CODES.has(code)) return false;
            return !/\s/.test(char);
        })
        .join('');

export const normalizeEmail = (value: string | undefined | null): string =>
    stripInvisible(value);

export const normalizePhone = (value: string | undefined | null): string =>
    stripInvisible(value);
