import {
    EnumDealCurrentDocumentFieldCode,
    EnumDealDocumentFieldCode,
} from './bx-document-deal-fields.type';

export enum EDealFieldType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    DATE = 'date',
    DATETIME = 'datetime',
    ENUMERATION = 'enumeration',
    MULTIPLE = 'multiple',
    FILE = 'file',
}
export interface IDealDocumentCurrentContractFieldItem {
    bitrixId: string;
    name: string;
    sort: string;
}
export interface IDealDocumentCurrentContractField {
    id?: string;
    bitrixId: string;
    name: string;
    type: EDealFieldType;
    value: string;
    multiple: boolean;
    mandatory: boolean;
    group: string;
    list: IDealDocumentCurrentContractField[];
}

export const documentFields = {
    [EnumDealDocumentFieldCode.BID_CALL_STATUS]: {
        id: '10172',
        bitrixId: 'UF_CRM_8_1724399779',
        type: 'enumeration',
        list: [
            {
                bitrixId: '19968',
                name: 'Звонить на мобильный',
                sort: '10',
            },
            {
                bitrixId: '19970',
                name: 'По документам не звоните, я сама позвоню',
                sort: '20',
            },
            {
                bitrixId: '19972',
                name: 'Клиенту надо 3 КП',
                sort: '30',
            },
            {
                bitrixId: '19974',
                name: 'Будет через ЭМ',
                sort: '40',
            },
            {
                bitrixId: '19976',
                name: 'Нужна спецификация',
                sort: '50',
            },
            {
                bitrixId: '19978',
                name: 'Будет смотреть запись',
                sort: '60',
            },
            {
                bitrixId: '19980',
                name: 'Участников семинара напишу позже',
                sort: '70',
            },
            {
                bitrixId: '19982',
                name: 'Просит документы прислать не позже завтра',
                sort: '80',
            },
            {
                bitrixId: '19984',
                name: 'Город и время (если не понятно из заявки)',
                sort: '90',
            },
            {
                bitrixId: '19986',
                name: 'Семинар не указывать, вся сумма на ППК',
                sort: '100',
            },
            {
                bitrixId: '19988',
                name: 'Всю сумму в семинар, учётную политику в документах не прописываем',
                sort: '110',
            },
        ],
        name: 'Заявка',
        code: EnumDealDocumentFieldCode.BID_CALL_STATUS,
        multiple: true,
        mandatory: false,
    },

    [EnumDealDocumentFieldCode.ASSIGNED_DOCUMENT_NAME]: {
        id: '10176',
        bitrixId: 'UF_CRM_8_CONTACT_NAME',
        type: 'string',
        name: 'Имя Отчество контактного лица по документам',
        code: EnumDealDocumentFieldCode.ASSIGNED_DOCUMENT_NAME,
        multiple: true,
        mandatory: false,
    },

    [EnumDealDocumentFieldCode.UP_DATE]: {
        id: '10158',
        bitrixId: 'UF_CRM_8_1701062299',
        type: 'date',
        name: 'Дата предоставления услуги',
        code: EnumDealDocumentFieldCode.UP_DATE,
        multiple: false,
        mandatory: false,
    },
    [EnumDealDocumentFieldCode.BANK]: {
        id: '10130',
        bitrixId: 'UF_CRM_8_BANK',
        type: 'enumeration',
        list: [
            {
                bitrixId: '19958',
                name: 'Сбер',
                sort: '10',
            },
            {
                bitrixId: '19960',
                name: 'Точка 39 (НСК+Запад)',
                sort: '20',
            },
            {
                bitrixId: '19962',
                name: 'Точка 36 (Регионы)',
                sort: '30',
            },
        ],
        name: 'Банковские реквизиты Альфацентра для договора',
        code: EnumDealDocumentFieldCode.BANK,
        multiple: false,
        mandatory: false,
    },
    [EnumDealDocumentFieldCode.ASSIGNED_DOCUMENT_EMAIL]: {
        id: '10126',
        bitrixId: 'UF_CRM_8_1700582740',
        type: 'string',
        name: 'e-mail контактного лица по документам',
        code: EnumDealDocumentFieldCode.ASSIGNED_DOCUMENT_EMAIL,
        multiple: false,
        mandatory: false,
    },

    [EnumDealDocumentFieldCode.PACKET_EMAIL]: {
        id: '10124',
        bitrixId: 'UF_CRM_8_EMAIL_CONTACT_FOR_DOR',
        type: 'string',
        name: 'e-mail для отправки Комплекта/Доступа',
        code: EnumDealDocumentFieldCode.PACKET_EMAIL,
        multiple: false,
        mandatory: false,
    },

    [EnumDealDocumentFieldCode.COMMENT_FOR_OD]: {
        id: '10202',
        bitrixId: 'UF_CRM_8_1724421715',
        type: 'string',
        name: 'Комментарий для сотрудника ОДО',
        code: EnumDealDocumentFieldCode.COMMENT_FOR_OD,
        multiple: false,
        mandatory: false,
    },

    [EnumDealDocumentFieldCode.NAME_PRODUCT_NOT_PREFIX]: {
        id: '10210',
        bitrixId: 'UF_CRM_8_NAME_PRODUCT_NOT_PREFIX',
        type: 'string',
        name: 'Наименование без префикса',
        code: EnumDealDocumentFieldCode.NAME_PRODUCT_NOT_PREFIX,
        multiple: false,
        mandatory: false,
    },

    [EnumDealDocumentFieldCode.NUMBER_DOC]: {
        id: '10216',
        bitrixId: 'UF_CRM_8_NUMBER_DOC',
        type: 'string',
        name: 'Номер документа',
        code: EnumDealDocumentFieldCode.NUMBER_DOC,
        multiple: false,
        mandatory: false,
    },

    [EnumDealDocumentFieldCode.NUMBER_CURRENT_DOC]: {
        id: '10218',
        bitrixId: 'UF_CRM_8_NUMBER_CURRENT_DOC',
        type: 'string',
        name: 'Номер текущего договора',
        code: EnumDealDocumentFieldCode.NUMBER_CURRENT_DOC,
        multiple: false,
        mandatory: false,
    },

    [EnumDealDocumentFieldCode.PREFIX_DYNAMIC]: {
        id: '10226',
        bitrixId: 'UF_CRM_8_PREFIX',
        type: 'string',
        name: 'Префикс',
        code: EnumDealDocumentFieldCode.PREFIX_DYNAMIC,
        multiple: false,
        mandatory: false,
    },

    [EnumDealDocumentFieldCode.CONSULTING_POINT_CONTRACT]: {
        id: '10228',
        bitrixId: 'UF_CRM_8_CONSULTING_POINT_CONTARCT',
        type: 'string',
        name: 'Пункт 1.1.2 семинар + ППК',
        code: EnumDealDocumentFieldCode.CONSULTING_POINT_CONTRACT,
        multiple: false,
        mandatory: false,
    },

    [EnumDealDocumentFieldCode.PAYMENT_POIT_DOC]: {
        id: '10230',
        bitrixId: 'UF_CRM_8_PAYMENT_POIT_DOC',
        type: 'string',
        name: 'Пункт 3.4',
        code: EnumDealDocumentFieldCode.PAYMENT_POIT_DOC,
        multiple: false,
        mandatory: false,
    },

    [EnumDealDocumentFieldCode.SUBJECT_FOR_SEND_MESSAGE]: {
        id: '10262',
        bitrixId: 'UF_CRM_8_SUBJECT_FOR_SEND_MESSAGE',
        type: 'string',
        name: 'Тема письма',
        code: EnumDealDocumentFieldCode.SUBJECT_FOR_SEND_MESSAGE,
        multiple: false,
        mandatory: false,
    },
    [EnumDealDocumentFieldCode.CONTRACT_TYPE]: {
        id: '10264',
        bitrixId: 'UF_CRM_8_1700638045',
        type: 'enumeration',
        list: [
            {
                bitrixId: '20014',
                name: 'УП комплектом',
                sort: '10',
            },
            {
                bitrixId: '20016',
                name: 'УП видеозапись',
                sort: '20',
            },
            {
                bitrixId: '20018',
                name: 'Семинар',
                sort: '30',
            },
            {
                bitrixId: '20020',
                name: 'Семинар ППК',
                sort: '40',
            },
            {
                bitrixId: '20022',
                name: 'ППК',
                sort: '50',
            },
        ],
        name: 'Тип',
        code: EnumDealDocumentFieldCode.CONTRACT_TYPE,
        multiple: false,
        mandatory: false,
    },
    [EnumDealDocumentFieldCode.POTENTIAL_COMPANIES]: {
        id: '10266',
        bitrixId: 'UF_CRM_1754126878',
        type: 'string',
        name: 'Потенциальные компании',
        code: EnumDealDocumentFieldCode.POTENTIAL_COMPANIES,
        multiple: true,
        mandatory: false,
    },
    [EnumDealDocumentFieldCode.CURRENT_RQ]: {
        id: '10268',
        bitrixId: 'UF_CRM_1754126955',
        type: 'string',
        name: 'Текущий РК',
        code: EnumDealDocumentFieldCode.CURRENT_RQ,
        multiple: false,
        mandatory: false,
    },
} as const;

export const currentDocumentFields = {
    [EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_URL]: {
        id: '10238',
        bitrixId: 'UF_CRM_8_1726594856948',
        type: 'url',
        name: 'Ссылка на приложение',
        code: EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_URL,
        multiple: false,
        mandatory: false,
    },
    [EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_DOC]: {
        id: '10246',
        bitrixId: 'UF_CRM_8_1726569165',
        type: 'file',
        name: 'Текущее приложение ППК',
        code: EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_DOC,
        multiple: false,
        mandatory: false,
    },
    [EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_PDF]: {
        id: '10248',
        bitrixId: 'UF_CRM_8_FILE_PDF_APP',
        type: 'file',
        name: 'Текущее приложение ППК pdf',
        code: EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_PDF,
        multiple: false,
        mandatory: false,
    },
    [EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT]: {
        id: '10250',
        bitrixId: 'UF_CRM_8_CURRENT_ACT',
        type: 'file',
        name: 'Текущий акт',
        code: EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT,
        multiple: false,
        mandatory: false,
    },
    [EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT]: {
        id: '10252',
        bitrixId: 'UF_CRM_8_DOCX_CURRENT_CONTRACT_NOT_PT',
        type: 'file',
        name: 'Текущий договор без печати',
        code: EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT,
        multiple: false,
        mandatory: false,
    },
    [EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITH_PT]: {
        id: '10254',
        bitrixId: 'UF_CRM_8_1724325011',
        type: 'file',
        name: 'Текущий договор с печатью',
        code: EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITH_PT,
        multiple: false,
        mandatory: false,
    },

    [EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT]: {
        id: '10256',
        bitrixId: 'UF_CRM_8_DOCX_CURRENT_ACCOUNT_NOT_PT',
        type: 'file',
        name: 'Текущий счет без печати',
        code: EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT,
        multiple: false,
        mandatory: false,
    },
    [EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT]: {
        id: '10258',
        bitrixId: 'UF_CRM_8_1724325041',
        type: 'file',
        name: 'Текущий счет с печатью',
        code: EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT,
        multiple: false,
        mandatory: false,
    },
} as const;
