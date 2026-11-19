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
 * Строгой проверки нет намеренно: решать, полон ли комплект, менеджеру —
 * он видит карточку и знает, что согласовано с клиентом. Нам важно только
 * не дать уйти письму с пустыми вложениями: робот берёт файлы из полей
 * сделки, и если там нет ничего, клиент получит текст «во вложении
 * Договор, Счёт и УПД» и ни одного файла. Отозвать такое письмо нельзя.
 *
 * `total` — сколько документов требуется по типу договора,
 * `missing` — сколько из них не сформировано. Пусто всё → не отправляем.
 */
export const canSendOnly = (
    missing: IDealRequiredDocumentField[] | null | undefined,
    total: number,
): boolean => {
    const missingCount = missing?.length ?? 0;
    if (!total) return true;

    //ни одного документа в сделке — отправлять нечего
    return missingCount < total;
};

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
 * Перечисляем поимённо: «комплект неполный» не говорит, что делать,
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
