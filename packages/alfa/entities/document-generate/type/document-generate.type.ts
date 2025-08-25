export enum EContractType {
    seminar = 'seminar',
    ppk = 'ppk',
    seminar_ppk = 'seminar_ppk',
    up = 'up',
}
export enum EContractName {
    seminar = 'Семинар',
    ppk = 'ППК',
    seminar_ppk = 'Семинар ППК',
    up = 'УП',
}
export enum DocumentGenerateFieldTemplateCode {
    ClientRq = 'ClientRq',
    Header = 'Header',
    Paragraph12 = 'Paragraph12',
    EndActionDate = 'EndActionDate',
    DocumentPrefixNumber = 'DocumentPrefixNumber',
    DocumentNumberCounter = 'DocumentNumberCounter',
    Paragraph3 = 'Paragraph3',
}
export type DocumentGenerateFieldTemplateType = {
    id: number;
    name: string;
    code: DocumentGenerateFieldTemplateCode;
    templateCode: DocumentGenerateFieldTemplateCode;
    type: string;
};
export type DocumentGenerateTemplateType = {
    id: number;
    name: string;
    code: string;
    fields: DocumentGenerateFieldTemplateType[];
};
export type DocumentContractSeminarPpkFieldsType =
    typeof DocumentGenerateTemplatesType.SEMINAR_PPK_DEAL.fields;
export type DocumentContractSeminarDealFieldsType =
    typeof DocumentGenerateTemplatesType.SEMINAR_DEAL.fields;
export type DocumentContractPpkDealFieldsType =
    typeof DocumentGenerateTemplatesType.PPK_DEAL.fields;
export type DocumentContractInvoiceWithStampsFieldsType =
    typeof DocumentGenerateTemplatesType.INVOISE_WITH_STAMPS.fields;
export type DocumentContractInvoiceWithoutStampsFieldsType =
    typeof DocumentGenerateTemplatesType.INVOISE_WITHOUT_STAMPS.fields;
export type DocumentContractActFieldsType =
    typeof DocumentGenerateTemplatesType.ACT.fields;

export const DocumentGenerateTemplatesType = {
    SEMINAR_PPK_DEAL: {
        id: 134,
        name: 'Договор Семинар ППК СДЕЛКА',
        code: 'ContractSeminarPPKDeal',
        fields: [
            {
                name: 'Клиент',

                code: DocumentGenerateFieldTemplateCode.ClientRq,
                templateCode: DocumentGenerateFieldTemplateCode.ClientRq,
                type: 'string',
            },
            {
                name: 'Шапка договора',
                code: DocumentGenerateFieldTemplateCode.Header,
                templateCode: DocumentGenerateFieldTemplateCode.Header,
                type: 'string',
            },
            {
                name: 'Текст договора',
                code: DocumentGenerateFieldTemplateCode.Paragraph12,
                templateCode: DocumentGenerateFieldTemplateCode.Paragraph12,
                type: 'string',
            },
            {
                name: 'Конец действия договора',
                code: DocumentGenerateFieldTemplateCode.EndActionDate,
                templateCode: DocumentGenerateFieldTemplateCode.EndActionDate,
                type: 'date',
            },
            {
                name: 'Текст договора',
                code: DocumentGenerateFieldTemplateCode.Paragraph3,
                templateCode: DocumentGenerateFieldTemplateCode.Paragraph3,
                type: 'string',
            },
            {
                name: 'Номер документа',
                code: DocumentGenerateFieldTemplateCode.DocumentPrefixNumber,
                templateCode:
                    DocumentGenerateFieldTemplateCode.DocumentPrefixNumber,
                type: 'string',
            },
            {
                name: 'Номер документа счетчик',
                code: DocumentGenerateFieldTemplateCode.DocumentNumberCounter,
                templateCode:
                    DocumentGenerateFieldTemplateCode.DocumentNumberCounter,
                type: 'string',
            },
        ] as const,
        forContract: [EContractType.seminar_ppk] as EContractType[],
    } as const,
    SEMINAR_DEAL: {
        id: 142,
        name: 'Договор Семинар СДЕЛКА',
        code: 'ContractSeminarDeal',
        fields: [
            {
                name: 'Клиент',
                code: 'client',
                templateCode: 'ClientRq',
                type: 'string',
            },
            {
                name: 'Шапка договора',
                code: 'Header',
                templateCode: 'Header',
                type: 'string',
            },
            {
                name: 'Текст договора',
                code: 'paragraph',
                templateCode: 'Paragraph12',
                type: 'string',
            },
            {
                name: 'Конец действия договора',
                code: 'endDate',
                templateCode: 'EndActionDate',
                type: 'date',
            },
        ],
        forContract: [EContractType.seminar] as EContractType[],
    } as const,
    PPK_DEAL: {
        id: 144,
        name: 'Договор ППК СДЕЛКА',
        code: 'ContractPPKDeal',
        fields: [
            {
                name: 'Клиент',

                code: 'client',
                templateCode: 'ClientRq',
                type: 'string',
            },
            {
                name: 'Шапка договора',
                code: 'Header',
                templateCode: 'Header',
                type: 'string',
            },
            {
                name: 'Текст договора',
                code: 'paragraph',
                templateCode: 'Paragraph12',
                type: 'string',
            },
            {
                name: 'Конец действия договора',
                code: 'endDate',
                templateCode: 'EndActionDate',
                type: 'date',
            },
            {
                name: 'Текст договора',
                code: 'paragraph3',
                templateCode: 'Paragraph3',
                type: 'string',
            },
        ],
        forContract: [EContractType.ppk] as EContractType[],
    } as const,
    INVOISE_WITH_STAMPS: {
        id: 136,
        name: 'Счет с печатью СЕМИНАРЫ СДЕЛКА',
        code: 'InvoiceWithStamps',
        fields: [
            {
                name: 'Реквизиты для счета',
                code: 'InvoiceRq',
                templateCode: 'InvoiceRq',
                type: 'string',
            },
        ],
        forContract: [
            EContractType.seminar,
            EContractType.seminar_ppk,
            EContractType.ppk,
            EContractType.up,
        ] as EContractType[],
    } as const,
    INVOISE_WITHOUT_STAMPS: {
        id: 138,
        name: 'Счет без печати СЕМИНАРЫ СДЕЛКА',
        code: 'InvoiceWithoutStamps',
        fields: [
            {
                name: 'Реквизиты для счета',
                code: 'InvoiceRq',
                templateCode: 'InvoiceRq',
                type: 'string',
            },
        ],
        forContract: [
            EContractType.seminar,
            EContractType.seminar_ppk,
            EContractType.ppk,
            EContractType.up,
        ] as EContractType[],
    } as const,
    ACT: {
        id: 132,
        name: 'Акт оказанных услуг',
        code: 'Act',
        fields: [
            {
                name: 'Реквизиты для счета',
                code: 'InvoiceRq',
                templateCode: 'InvoiceRq',
                type: 'string',
            },
        ],
        forContract: [
            EContractType.seminar,
            EContractType.seminar_ppk,
            EContractType.ppk,
            EContractType.up,
        ] as EContractType[],
    } as const,
};

export type DocumentGenerateType = typeof DocumentGenerateTemplatesType;
