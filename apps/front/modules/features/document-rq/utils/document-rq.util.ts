import { RQ_TYPE } from '@workspace/bx-rq';
import {
    DocumentFizRqAgent,
    DocumentOrganizationRqAgent,
    DocumentRqAgent,
} from '../model/slice/DocumentRqSlice';
import {
    EnumDocumentFizRqFields,
    EnumDocumentOrganizationRqFields,
    EnumFizRqFields,
    EnumOrganizationRqFields,
} from '../type/document-rq.type';

export type DocumentPreviewLineKey =
    | 'fullname'
    | 'inn'
    | 'kpp'
    | 'address'
    | 'phone'
    //паспортные данные — только для физлица
    | 'documentType'
    | 'docSeries'
    | 'docNumber'
    | 'docDate'
    | 'depCode'
    | 'other'
    | 'base_other';

//ключи, которые показываем только физлицу
const FIZ_ONLY_KEYS: DocumentPreviewLineKey[] = [
    'documentType',
    'docSeries',
    'docNumber',
    'docDate',
    'depCode',
];

export type DocumentPreviewSection = 'base' | 'address' | 'bankComment';

export interface DocumentPreviewLine {
    key: DocumentPreviewLineKey;
    label: string;
    value: string;
    isEmpty: boolean;
    section: DocumentPreviewSection;
    canEdit: boolean;
    tooltip: string;
}

const EMPTY_LINE = '________________________________________';

const isEmptyValue = (value: string): boolean => {
    const normalized = value.trim();
    if (!normalized) return true;
    if (/^_+$/.test(normalized)) return true;
    if (normalized.includes(EMPTY_LINE)) return true;
    //значения вида «Серия: ______» — сервис отдает их с подписью и прочерком
    if (/^[^:]*:\s*_+$/.test(normalized)) return true;
    return false;
};

const getTooltip = (label: string, canEdit: boolean, isEmpty: boolean): string => {
    if (!canEdit) {
        return `Создайте реквизиты чтобы заполнить ${label}`;
    }
    return isEmpty ? `Нажмите чтобы добавить ${label}` : `Нажмите чтобы изменить ${label}`;
};

export const getForDocumentItems = (
    client: DocumentRqAgent<RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION> | null,
    clientType: RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION,
    provider: DocumentRqAgent<RQ_TYPE.ORGANIZATION> | null,
) => {
    if (!client || !provider) {
        return {
            client: [] as string[] | string[][],
            provider: [] as string[],
        };
    }
    // Получаем ключи и фильтруем TYPE
    const clientKeys = Object.keys(client).filter(
        key => key !== EnumFizRqFields.TYPE,
    );
    const providerKeys = Object.keys(provider).filter(
        key => key !== EnumOrganizationRqFields.TYPE,
    );

    // Сортируем ключи по enum
    const sortedClientKeys =
        clientType === RQ_TYPE.ORGANIZATION
            ? sortByEnumOrder(clientKeys, EnumDocumentOrganizationRqFields)
            : sortByEnumOrder(clientKeys, EnumDocumentFizRqFields);

    const sortedProviderKeys = sortByEnumOrder(
        providerKeys,
        EnumDocumentOrganizationRqFields,
    );

    // Получаем значения по отсортированным ключам
    const clientValues = sortedClientKeys
        .map(key => {
            if (
                clientType === RQ_TYPE.ORGANIZATION &&
                Object.values(EnumDocumentOrganizationRqFields).includes(
                    key as EnumDocumentOrganizationRqFields,
                )
            ) {
                return (client as DocumentOrganizationRqAgent)[
                    key as keyof DocumentOrganizationRqAgent
                ];
            } else if (
                clientType === RQ_TYPE.FIZ &&
                Object.values(EnumDocumentFizRqFields).includes(
                    key as EnumDocumentFizRqFields,
                )
            ) {
                return (client as DocumentFizRqAgent)[
                    key as keyof DocumentFizRqAgent
                ];
            }
            return null;
        })
        .filter(value => value !== null && value !== "" && value !== undefined);
    const normalizedClientValues = clientValues
        .flatMap(item =>
            splitRqValueToLines(item)
        )
        .filter(value => value !== null && value !== "" && value !== undefined);

    const providerValues = sortedProviderKeys
        .map(key => {
            if (
                provider.type === RQ_TYPE.ORGANIZATION &&
                Object.values(EnumDocumentOrganizationRqFields).includes(
                    key as EnumDocumentOrganizationRqFields,
                )
            ) {
                return (provider as DocumentOrganizationRqAgent)[
                    key as keyof DocumentOrganizationRqAgent
                ];
            }
            return null;
        })
        .filter(value => value !== null);


    return {
        client: normalizedClientValues,
        provider: providerValues,
    };
};

export const getClientPreviewLines = (
    client: DocumentRqAgent<RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION> | null,
    clientType: RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION,
    isBaseCreated: boolean,
): DocumentPreviewLine[] => {

    if (!client) return [];

    const fullname =
        clientType === RQ_TYPE.ORGANIZATION
            ? (client as DocumentOrganizationRqAgent).fullname || EMPTY_LINE
            : (client as DocumentFizRqAgent).name || EMPTY_LINE;
    const inn = (client as DocumentOrganizationRqAgent).inn || EMPTY_LINE;
    const kpp =
        clientType === RQ_TYPE.ORGANIZATION
            ? (client as DocumentOrganizationRqAgent).kpp || EMPTY_LINE
            : EMPTY_LINE;
    const address =
        (client as DocumentOrganizationRqAgent).address || EMPTY_LINE;
    const phone = (client as DocumentOrganizationRqAgent).phone || EMPTY_LINE;
    const other = (client as DocumentOrganizationRqAgent).other || EMPTY_LINE;
    const baseOther = (client as DocumentOrganizationRqAgent).base_other || EMPTY_LINE;

    //паспортные данные физлица — значения уже приходят с подписями
    //(«Серия: 1234», «Документ выдан: 01.01.2020, ОУФМС ...») из BxClientRqService
    const fizClient = client as DocumentFizRqAgent;
    const documentType = fizClient.documentType || EMPTY_LINE;
    const docSeries = fizClient.docSeries || EMPTY_LINE;
    const docNumber = fizClient.docNumber || EMPTY_LINE;
    const docDate = fizClient.docDate || EMPTY_LINE;
    const depCode = fizClient.depCode || EMPTY_LINE;

    const lines: DocumentPreviewLine[] = [
        {
            key: 'fullname',
            label: 'Наименование',
            value: fullname,
            isEmpty: isEmptyValue(fullname),
            section: 'base',
            canEdit: true,
            tooltip: getTooltip('наименование', true, isEmptyValue(fullname)),
        },
        {
            key: 'inn',
            label: 'ИНН',
            value: inn,
            isEmpty: isEmptyValue(inn),
            section: 'base',
            canEdit: true,
            tooltip: getTooltip('ИНН', true, isEmptyValue(inn)),
        },
        {
            key: 'kpp',
            label: 'КПП',
            value: kpp,
            isEmpty: isEmptyValue(kpp),
            section: 'base',
            canEdit: true,
            tooltip: getTooltip('КПП', true, isEmptyValue(kpp)),
        },
        {
            key: 'address',
            label: 'Юридический адрес',
            value: address,
            isEmpty: isEmptyValue(address),
            section: 'address',
            canEdit: isBaseCreated,
            tooltip: getTooltip('юридический адрес', isBaseCreated, isEmptyValue(address)),
        },
        {
            key: 'phone',
            label: 'Телефон',
            value: phone,
            isEmpty: isEmptyValue(phone),
            section: 'base',
            canEdit: true,
            tooltip: getTooltip('телефон', true, isEmptyValue(phone)),
        },
        {
            key: 'documentType',
            label: 'Вид документа',
            value: documentType,
            isEmpty: isEmptyValue(documentType),
            section: 'base',
            canEdit: true,
            tooltip: getTooltip('вид документа', true, isEmptyValue(documentType)),
        },
        {
            key: 'docSeries',
            label: 'Серия документа',
            value: docSeries,
            isEmpty: isEmptyValue(docSeries),
            section: 'base',
            canEdit: true,
            tooltip: getTooltip('серию документа', true, isEmptyValue(docSeries)),
        },
        {
            key: 'docNumber',
            label: 'Номер документа',
            value: docNumber,
            isEmpty: isEmptyValue(docNumber),
            section: 'base',
            canEdit: true,
            tooltip: getTooltip('номер документа', true, isEmptyValue(docNumber)),
        },
        {
            key: 'docDate',
            label: 'Кем и когда выдан документ',
            value: docDate,
            isEmpty: isEmptyValue(docDate),
            section: 'base',
            canEdit: true,
            tooltip: getTooltip(
                'дату выдачи и кем выдан документ',
                true,
                isEmptyValue(docDate),
            ),
        },
        {
            key: 'depCode',
            label: 'Код подразделения',
            value: depCode,
            isEmpty: isEmptyValue(depCode),
            section: 'base',
            canEdit: true,
            tooltip: getTooltip('код подразделения', true, isEmptyValue(depCode)),
        },
        {
            key: 'base_other',
            label: 'Дополнительные реквизиты',
            value: baseOther,
            isEmpty: isEmptyValue(baseOther),
            section: 'base',
            canEdit: true,
            tooltip: getTooltip('дополнительные реквизиты', true, isEmptyValue(baseOther)),
        },
        {
            key: 'other',
            label: 'Прочие реквизиты',
            value: other,
            isEmpty: isEmptyValue(other),
            section: 'bankComment',
            canEdit: true,
            tooltip: getTooltip('прочие реквизиты', true, isEmptyValue(other)),
        },
    ];

    //физлицу не показываем КПП, всем остальным — паспортные данные
    if (clientType !== RQ_TYPE.ORGANIZATION) {
        return lines.filter(line => line.key !== 'kpp');
    }
    return lines.filter(line => !FIZ_ONLY_KEYS.includes(line.key));
};

// Функция для сортировки по порядку элементов в enum
const sortByEnumOrder = <T extends string>(
    keys: string[],
    enumObj: Record<string, T>,
): string[] => {
    const enumValues = Object.values(enumObj);
    return keys.sort((a, b) => {
        const aIndex = enumValues.indexOf(a as T);
        const bIndex = enumValues.indexOf(b as T);

        // Если оба элемента есть в enum, сортируем по их позиции
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }

        // Если только один элемент в enum, он идет первым
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;

        // Если ни один элемент не в enum, сохраняем исходный порядок
        return 0;
    });
};



export const splitRqValueToLines = (value: unknown): string[] => {
    if (typeof value !== 'string') return [];
    const normalized = value
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // превращаем \n, \\n, \\\\n и т.п. в реальный '\n'
        .replace(/\\+n/g, '\n');
    return normalized.split('\n');
};
