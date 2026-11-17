import {
    AlfaParticipantSmartItemUserFieldsEnum as F,
    normalizeEmail,
    normalizePhone,
} from '@alfa/entities';

/**
 * Отпечаток участника: по нему прием заявки узнает, что такого участника
 * на сделке уже завели, и не создает второго.
 *
 * Почему отпечаток по всем полям, а не поиск «того же человека» по email
 * или ФИО. Заявку пинают повторно как раз тогда, когда в ней ошибка —
 * значит ошибиться может любое поле, и ни одно из них не годится в
 * опознавательный признак. Зато верно обратное: если совпали все поля,
 * это та же самая заявка, и делать нечего.
 *
 * Что из этого следует для менеджера:
 *
 * - повторный прием одной и той же заявки (крон поверх вебхука, перевод
 *   стадии, двойной клик) участников не задваивает;
 * - исправили ошибку и перепнули — отпечаток другой, участник создается
 *   заново, а ошибочный остается рядом и удаляется руками. Это сознательный
 *   выбор: отличить «исправили опечатку в ФИО» от «добавили второго
 *   человека с похожими данными» нельзя, а затереть живого участника,
 *   на котором уже висят документы, хуже лишней карточки;
 * - участника убрали из заявки — он остается в сделке.
 *
 * Поля взяты те, что прием пишет в карточку (TSmartFieldCode в
 * lib/smart-helper), без служебных: ни id, ни стадия, ни ответственный,
 * ни даты в отпечаток не входят — иначе он не совпадет никогда.
 */

/**
 * Поля, по которым считается отпечаток.
 *
 * Порядок важен: по нему склеивается строка. Новое поле заявки добавлять
 * сюда же, иначе прием не заметит его изменения и повторный пинок после
 * правки этого поля ничего не создаст.
 */
export const FINGERPRINT_FIELDS: string[] = [
    F.ufCrm12Name, //ФИО
    F.ufCrm12Email, //E-mail
    F.ufCrm12Phone, //Телефон
    F.ufCrm12Format, //Формат участия
    F.ufCrm12IsPpk, //Участвует в ППК
    F.ufCrm12Days, //Дни участия (семинары)
    F.ufCrm12AccountantGos, //Программы ППК: бухгалтеры бюджетной сферы
    F.ufCrm12AccountantMedical, //Программы ППК: здравоохранение
    F.ufCrm12Zakupki, //Программы ППК: закупки
    F.ufCrm12Kadry, //Программы ППК: кадры
    F.ufCrm12Corruption, //Программы ППК: антикоррупционная деятельность
    F.ufCrm12AddressForUdost, //Адрес для отправки удостоверения
    F.ufCrm12Comment, //Комментарий
];

/** Разделители внутри отпечатка — заведомо не встречаются в значениях полей */
const FIELD_SEPARATOR = '\u0001';
const VALUE_SEPARATOR = '\u0002';

/**
 * Приводит значение одного поля к строке.
 *
 * Множественные поля портала приходят то массивом, то одним значением, и
 * порядок элементов в них не гарантирован — сортируем, иначе один и тот же
 * набор дней даст разные отпечатки. Email и телефон чистятся теми же
 * функциями, что и на записи из карточки: иначе копипаст с неразрывным
 * пробелом выглядел бы новым участником.
 */
const normalizeFieldValue = (bitrixId: string, value: unknown): string => {
    //значения полей портала приходят разнотипными: строка, число, массив.
    //Объект в отпечаток не берём — он дал бы «[object Object]» и совпал бы
    //с любым другим объектом, то есть молча склеил разных участников
    const asText = (item: unknown): string => {
        if (typeof item === 'string') return item;
        if (typeof item === 'number' || typeof item === 'boolean') {
            return String(item);
        }
        return '';
    };

    const normalizeOne = (item: unknown): string => {
        const text = asText(item);
        if (bitrixId === F.ufCrm12Email) return normalizeEmail(text);
        if (bitrixId === F.ufCrm12Phone) return normalizePhone(text);
        return text.trim();
    };

    if (Array.isArray(value)) {
        return value
            .map(normalizeOne)
            .filter((item) => item !== '')
            .sort()
            .join(VALUE_SEPARATOR);
    }

    return normalizeOne(value);
};

/**
 * Отпечаток участника по набору его полей.
 *
 * Регистр ФИО и остальных текстовых полей сохраняется: «иванов» и «Иванов»
 * считаются разными. Так и надо — исправление регистра в ФИО это правка
 * заявки, и участник должен создаться заново, чтобы менеджер увидел оба
 * варианта и выбрал верный.
 */
export const getParticipantFingerprint = (
    fields: Record<string, unknown>,
): string =>
    FINGERPRINT_FIELDS.map(
        (bitrixId) =>
            `${bitrixId}=${normalizeFieldValue(bitrixId, fields?.[bitrixId])}`,
    ).join(FIELD_SEPARATOR);

/**
 * Делит участников заявки на тех, кого надо создать, и тех, кто уже есть.
 *
 * Внутри одной заявки тоже бывают полные близнецы — два участника с
 * одинаковыми полями. Это ошибка заполнения, но решать ее не нам: такие
 * создаются оба, как создавались раньше, иначе прием молча потерял бы
 * строку заявки. Отсекаем только совпадения с теми, кто уже в сделке.
 */
export const splitParticipantsToCreate = <T extends Record<string, unknown>>(
    fromBid: T[],
    existing: Record<string, unknown>[],
): { toCreate: T[]; skipped: T[] } => {
    const existingPrints = new Set(existing.map(getParticipantFingerprint));

    const toCreate: T[] = [];
    const skipped: T[] = [];

    for (const participant of fromBid) {
        const print = getParticipantFingerprint(participant);
        if (existingPrints.has(print)) {
            skipped.push(participant);
        } else {
            toCreate.push(participant);
        }
    }

    return { toCreate, skipped };
};
