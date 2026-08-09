/**
 * Невидимые символы, которые прилетают при копипасте из word/почты/мессенджеров
 * и не покрываются \s: мягкий перенос, zero-width space/non-joiner/joiner, BOM.
 * Перечислением, а не классом символов: zwnj/zwj внутри класса триггерят
 * no-misleading-character-class, так как трактуются как склейка графем
 */
const INVISIBLE_CHARS = /\u00AD|\u200B|\u200C|\u200D|\uFEFF/g;

/**
 * Убирает пробелы, переносы строк и невидимые спецсимволы.
 * \s покрывает обычный пробел, табы, переносы, NBSP (\u00A0) и узкий NBSP (\u202F).
 */
export const stripInvisible = (value: string): string =>
    value.replace(INVISIBLE_CHARS, '').replace(/\s/g, '');

export const normalizeEmail = (value: string): string => stripInvisible(value);

export const normalizePhone = (value: string): string => stripInvisible(value);
