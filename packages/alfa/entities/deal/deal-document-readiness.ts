import { currentDocumentFields, documentFields } from './bx-document-deal-fields';
import {
    EnumDealCurrentDocumentFieldCode,
    EnumDealDocumentFieldCode,
} from './bx-document-deal-fields.type';
import {
    EContractName,
    EContractType,
} from '../document-generate/type/document-generate.type';

export interface IDealRequiredDocumentField {
    code: EnumDealCurrentDocumentFieldCode | EnumDealDocumentFieldCode;
    bitrixId: string;
    name: string;
}

/**
 * Коды, для которых есть описание поля в currentDocumentFields
 * (не все члены enum имеют запись в объекте)
 */
type TCurrentDocumentFieldCode = keyof typeof currentDocumentFields;

/**
 * Поля сделки, которые должны содержать документы после генерации
 * для любого типа договора
 */
const BASE_REQUIRED_DOCUMENT_FIELD_CODES: TCurrentDocumentFieldCode[] = [
    EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT,
    EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT,
    EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT,
    EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT,
];

/**
 * Для ППК и Семинар+ППК помимо обычных документов
 * обязательно Приложение ППК
 */
const PPK_REQUIRED_DOCUMENT_FIELD_CODES: TCurrentDocumentFieldCode[] = [
    EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_DOC,
];

/**
 * Поле сделки "Тема письма" — бизнес-процесс отправки документов
 * не отправит письмо, пока оно не заполнено
 */
export const dealEmailSubjectField =
    documentFields[EnumDealDocumentFieldCode.SUBJECT_FOR_SEND_MESSAGE];

/**
 * Тема письма для отправки документов клиенту.
 * Формат должен совпадать с getDealSubject на фронте
 * (apps/front/modules/features/deal-email-subject)
 */
export const getDealEmailSubject = (
    prefix: string,
    counter: string | number,
): string =>
    `Документы на согласование Договор №${prefix}-${counter} от ООО "Альфацентр"`;

const CONTRACT_TYPE_BY_NAME: Record<string, EContractType> = {
    [EContractName.seminar]: EContractType.seminar,
    [EContractName.ppk]: EContractType.ppk,
    [EContractName.seminar_ppk]: EContractType.seminar_ppk,
    [EContractName.up_complect]: EContractType.up_complect,
    [EContractName.up_video]: EContractType.up_video,
    [EContractName.up_special]: EContractType.up_special,
};

export const isPpkContractType = (
    contractType: EContractType | null | undefined,
): boolean =>
    contractType === EContractType.ppk ||
    contractType === EContractType.seminar_ppk;

export const getRequiredDocumentFields = (
    contractType: EContractType | null | undefined,
): IDealRequiredDocumentField[] => {
    const codes = isPpkContractType(contractType)
        ? [
              ...BASE_REQUIRED_DOCUMENT_FIELD_CODES,
              ...PPK_REQUIRED_DOCUMENT_FIELD_CODES,
          ]
        : BASE_REQUIRED_DOCUMENT_FIELD_CODES;

    const fields: IDealRequiredDocumentField[] = codes.map((code) => {
        const field = currentDocumentFields[code];
        return {
            code,
            bitrixId: field.bitrixId,
            name: field.name,
        };
    });

    //тема письма обязательна для любого типа договора:
    //бизнес-процесс отправки проверяет ее вместе с файлами документов
    fields.push({
        code: dealEmailSubjectField.code,
        bitrixId: dealEmailSubjectField.bitrixId,
        name: dealEmailSubjectField.name,
    });

    return fields;
};

export const getRequiredDocumentFieldBitrixIds = (
    contractType: EContractType | null | undefined,
): string[] =>
    getRequiredDocumentFields(contractType).map((field) => field.bitrixId);

export const dealContractTypeField =
    documentFields[EnumDealDocumentFieldCode.CONTRACT_TYPE];

/**
 * Определяет тип договора по значению поля сделки "Тип"
 * (значение — id элемента списка enumeration)
 */
export const getContractTypeFromDeal = (
    deal: Record<string, unknown>,
): EContractType | null => {
    const rawValue = deal[dealContractTypeField.bitrixId];
    if (rawValue === null || rawValue === undefined || rawValue === '') {
        return null;
    }

    const listItem = dealContractTypeField.list.find(
        (item) => String(item.bitrixId) === String(rawValue),
    );
    if (!listItem) return null;

    return CONTRACT_TYPE_BY_NAME[listItem.name] ?? null;
};

/**
 * Проверка что значение поля сделки не пустое
 * (файловые поля возвращаются объектом {id, downloadUrl, ...})
 */
export const isDealDocumentFieldFilled = (value: unknown): boolean => {
    if (value === null || value === undefined || value === '' || value === false) {
        return false;
    }
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') {
        return Object.keys(value as Record<string, unknown>).length > 0;
    }
    return true;
};

/**
 * Возвращает список обязательных полей документов,
 * которые не заполнены в сделке
 */
export const getMissingDocumentFields = (
    deal: Record<string, unknown>,
    contractType?: EContractType | null,
): IDealRequiredDocumentField[] => {
    const resolvedContractType = contractType ?? getContractTypeFromDeal(deal);
    return getRequiredDocumentFields(resolvedContractType).filter(
        (field) => !isDealDocumentFieldFilled(deal[field.bitrixId]),
    );
};

/**
 * Готова ли сделка к отправке документов:
 * все обязательные (по типу договора) поля с документами заполнены
 */
export const isDealReadyForSend = (
    deal: Record<string, unknown>,
    contractType?: EContractType | null,
): boolean => getMissingDocumentFields(deal, contractType).length === 0;
