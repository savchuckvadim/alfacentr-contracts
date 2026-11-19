import { normalizeEmail } from '@alfa/entities';

/**
 * Правила выбора и привязки контакта для отправки документов.
 *
 * Робот Битрикса «Отправить письмо клиенту» не умеет выбирать получателя:
 * он берёт рабочий e-mail последнего добавленного контакта сделки. Значит
 * наш контакт должен быть в сделке последним — иначе письмо уйдёт не туда.
 *
 * Так и случилось со сделкой 204568 (19.11.2026): приём привязал контакт
 * из заявки в 08:52, в 09:32 менеджер вручную поставил компанию, Битрикс
 * снёс наш контакт и подставил три своих, а в 12:30 робот отправил
 * документы первому из них. Клиент письма не получил.
 */

interface ContactEmailEntry {
    VALUE?: unknown;
    VALUE_TYPE?: unknown;
}

export interface ContactLike {
    ID?: unknown;
    EMAIL?: unknown;
}

/** Тип адреса, с которым работает робот отправки */
export const WORK_EMAIL_TYPE = 'WORK';

const getEmails = (contact: ContactLike): ContactEmailEntry[] =>
    Array.isArray(contact?.EMAIL) ? (contact.EMAIL as ContactEmailEntry[]) : [];

/** Есть ли у контакта ровно этот адрес, без учёта регистра и мусора */
export const hasExactEmail = (contact: ContactLike, email: string): boolean => {
    const wanted = normalizeEmail(email).toLowerCase();
    if (!wanted) return false;

    return getEmails(contact).some(
        (entry) =>
            typeof entry?.VALUE === 'string' &&
            normalizeEmail(entry.VALUE).toLowerCase() === wanted,
    );
};

/** Стоит ли у контакта этот адрес как рабочий — именно его берёт робот */
export const hasWorkEmail = (contact: ContactLike, email: string): boolean => {
    const wanted = normalizeEmail(email).toLowerCase();
    if (!wanted) return false;

    return getEmails(contact).some(
        (entry) =>
            entry?.VALUE_TYPE === WORK_EMAIL_TYPE &&
            typeof entry?.VALUE === 'string' &&
            normalizeEmail(entry.VALUE).toLowerCase() === wanted,
    );
};

/**
 * Выбирает из найденных контактов тот, у которого действительно нужный адрес.
 *
 * Фильтр EMAIL у crm.contact.list работает как «содержит», а не «равно»,
 * поэтому в выдачу попадают посторонние. Раньше брался первый из списка и
 * ему же перезаписывался e-mail — то есть чужой карточке подменялся адрес,
 * а письмо уходило не тому человеку.
 *
 * Возвращает:
 * - exact — контакт с этим адресом, его и используем;
 * - needsWorkType — у него адрес есть, но не помечен рабочим: робот его не
 *   увидит, надо проставить тип;
 * - null — точного совпадения нет, заводим новый контакт.
 */
export const pickContactByEmail = <T extends ContactLike>(
    contacts: T[] | null | undefined,
    email: string,
): { exact: T | null; needsWorkType: boolean } => {
    const list = Array.isArray(contacts) ? contacts : [];

    const withWork = list.find((contact) => hasWorkEmail(contact, email));
    if (withWork) return { exact: withWork, needsWorkType: false };

    const withAny = list.find((contact) => hasExactEmail(contact, email));
    if (withAny) return { exact: withAny, needsWorkType: true };

    return { exact: null, needsWorkType: false };
};

/**
 * Порядок контактов сделки так, чтобы наш оказался последним.
 *
 * Остальных не выбрасываем: это контакты компании, менеджеры ими
 * пользуются. Робот возьмёт последнего добавленного — нашего.
 */
export const putContactLast = (
    currentIds: (number | string)[] | null | undefined,
    contactId: number,
): number[] => {
    const target = Number(contactId);
    if (!Number.isInteger(target) || target <= 0) return [];

    const rest = (Array.isArray(currentIds) ? currentIds : [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0 && id !== target);

    return [...rest, target];
};

/**
 * Нужно ли вообще переставлять привязку.
 *
 * Если наш контакт и так последний — не трогаем сделку: лишний вызов
 * портала и лишняя запись в истории
 */
export const isContactLast = (
    currentIds: (number | string)[] | null | undefined,
    contactId: number,
): boolean => {
    const list = Array.isArray(currentIds) ? currentIds : [];
    if (!list.length) return false;

    return Number(list[list.length - 1]) === Number(contactId);
};
