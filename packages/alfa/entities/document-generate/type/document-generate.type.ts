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

export type DocumentGenerateFieldTemplateType = {
    id: number;
    name: string;
    code: string;
    templateCode: string;
    type: string;
};
export type DocumentGenerateTemplateType = {
    id: number;
    name: string;
    code: string;
    fields: DocumentGenerateFieldTemplateType[];
};

export const DocumentGenerateTemplatesType = {
    SEMINAR_PPK_DEAL: {
        id: 134,
        name: 'Договор Семинар ППК СДЕЛКА',
        code: 'ContractSeminarPPKDeal',
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
        forContract: [EContractType.seminar_ppk] as EContractType[],
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
