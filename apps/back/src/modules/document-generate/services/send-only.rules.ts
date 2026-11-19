import { IDealRequiredDocumentField } from '@alfa/entities';

/**
 * Правила повторной отправки документов. Чистые функции без обращений к
 * порталу — чтобы их можно было гонять в jest.
 *
 * Обычная кнопка «Отправить» пересобирает весь пакет заново, а это нужно
 * не всегда: 19.11.2026 по сделке 204568 документы ушли не тому человеку,
 * и переотправить их надо было теми же файлами и с тем же номером.
 */

export interface MissingDocumentField {
    name: string;
    bitrixId: string;
}

/**
 * Можно ли отправлять.
 *
 * Документы здесь не генерируются, поэтому отсутствие хоть одного файла
 * означает, что роботу нечего приложить. Для ППК-договоров в этот набор
 * входит и приложение ППК — отправить договор без него нельзя.
 */
export const canSendOnly = (
    missing: IDealRequiredDocumentField[] | null | undefined,
): boolean => !((missing?.length ?? 0) > 0);

/** Недостающие поля в виде, пригодном для ответа фронту */
export const toMissingList = (
    missing: IDealRequiredDocumentField[] | null | undefined,
): MissingDocumentField[] =>
    (missing || []).map((field) => ({
        name: field.name,
        bitrixId: field.bitrixId,
    }));

/**
 * Текст менеджеру о том, чего не хватает.
 *
 * Перечисляем поимённо: «не готово к отправке» не говорит, что делать,
 * а «нет приложения ППК» — говорит
 */
export const renderMissingForManager = (
    missing: IDealRequiredDocumentField[] | null | undefined,
): string => {
    const names = (missing || []).map((field) => field.name).filter(Boolean);
    if (!names.length) return '';

    return names.length === 1
        ? `Не сформирован документ: ${names[0]}`
        : `Не сформированы документы: ${names.join(', ')}`;
};
