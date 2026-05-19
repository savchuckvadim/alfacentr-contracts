export enum EContractType {
    seminar = 'seminar',
    ppk = 'ppk',
    seminar_ppk = 'seminar_ppk',
    up_complect = 'up_complect',
    up_video = 'up_video',
    up_special = 'up_special',
}
export enum EContractName {
    seminar = 'Семинар',
    ppk = 'ППК',
    seminar_ppk = 'Семинар ППК',
    up_complect = 'УП комплектом',
    up_video = 'УП видеозапись',
    up_special = 'Спецпродукт',
}
export enum DocumentGenerateFieldTemplateCode {
    ACT_DATE = 'DateAct',
    CLIENT_SHORT_NAME = 'ShortClientName',
    CLIENT_UPD_ADDRESS = 'ClientUpdAddress',
    CLIENT_UPD_INN_KPP = 'InnKpp',
    ClientRq = 'ClientRq',
    Header = 'Header',
    Paragraph12 = 'Paragraph12',
    EndActionDate = 'EndActionDate',
    DocumentPrefixNumber = 'DocumentPrefixNumber',
    DocumentNumberCounter = 'DocumentNumberCounter',
    DocumentNumber = 'DocumentNumber',
    Paragraph3 = 'Paragraph3',
    ClientSignature = 'ClientSignature',
    UfCrm8EmailContactForDor = 'UfCrm8EmailContactForDor',
    DocumentCompanyTitle = 'DocumentCompanyTitle',
    DocumentDirectorInitials = 'DocumentDirectorInitials',

    //seminars
    DocumentParticipantsCount = 'DocumentParticipantsCount',
    DocumentContractEndDate = 'DocumentContractEndDate',
    MyCompanyBankDetailRqAccNum = 'MyCompanyBankDetailRqAccNum',
    MyCompanyBankDetailRqBankName = 'MyCompanyBankDetailRqBankName',
    MyCompanyBankDetailRqBik = 'MyCompanyBankDetailRqBik',
    MyCompanyBankDetailRqCorAccNum = 'MyCompanyBankDetailRqCorAccNum',
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
export type DocumentContractUPComplectFieldsType =
    typeof DocumentGenerateTemplatesType.UP_COMPLECT.fields;
export type DocumentContractUPVideoFieldsType =
    typeof DocumentGenerateTemplatesType.UP_VIDEO.fields;

export type DocumentContractUPSpecialFieldsType =
    typeof DocumentGenerateTemplatesType.UP_SPECIAL.fields;

export const OwnBankFields = [
    {
        name: 'Реквизиты банка р/с',
        code: DocumentGenerateFieldTemplateCode.MyCompanyBankDetailRqAccNum,
        templateCode: DocumentGenerateFieldTemplateCode.MyCompanyBankDetailRqAccNum,
        type: 'string',
    },
    {
        name: 'Реквизиты банка наименование банка',
        code: DocumentGenerateFieldTemplateCode.MyCompanyBankDetailRqBankName,
        templateCode: DocumentGenerateFieldTemplateCode.MyCompanyBankDetailRqBankName,
        type: 'string',
    },
    {
        name: 'Реквизиты банка БИК',
        code: DocumentGenerateFieldTemplateCode.MyCompanyBankDetailRqBik,
        templateCode: DocumentGenerateFieldTemplateCode.MyCompanyBankDetailRqBik,
        type: 'string',
    },
    {
        name: 'Реквизиты банка к/с',
        code: DocumentGenerateFieldTemplateCode.MyCompanyBankDetailRqCorAccNum,
        templateCode: DocumentGenerateFieldTemplateCode.MyCompanyBankDetailRqCorAccNum,
        type: 'string',
    },
];
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
            {
                name: 'Подпись клиента',
                code: DocumentGenerateFieldTemplateCode.ClientSignature,
                templateCode: DocumentGenerateFieldTemplateCode.ClientSignature,
                type: 'string',
            },

            {
                name: 'Email контакта для договора (электронном виде на адрес электронной почты )',
                code: DocumentGenerateFieldTemplateCode.UfCrm8EmailContactForDor,
                templateCode:
                    DocumentGenerateFieldTemplateCode.UfCrm8EmailContactForDor,
                type: 'string',
            },
            ...OwnBankFields,
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
                name: 'Подпись клиента',
                code: DocumentGenerateFieldTemplateCode.ClientSignature,
                templateCode: DocumentGenerateFieldTemplateCode.ClientSignature,
                type: 'string',
            },
            {
                name: 'Количество участников(слушателей) семинара',
                code: DocumentGenerateFieldTemplateCode.DocumentParticipantsCount,
                templateCode:
                    DocumentGenerateFieldTemplateCode.DocumentParticipantsCount,
                type: 'string',
            },
            {
                name: 'В случае участия в семинаре онлайн адрес электронной почты',
                code: DocumentGenerateFieldTemplateCode.UfCrm8EmailContactForDor,
                templateCode:
                    DocumentGenerateFieldTemplateCode.UfCrm8EmailContactForDor,
                type: 'string',
            },

            {
                name: 'Договор действует до',
                code: DocumentGenerateFieldTemplateCode.DocumentContractEndDate,
                templateCode:
                    DocumentGenerateFieldTemplateCode.DocumentContractEndDate,
                type: 'string',
            },

            {
                name: 'Если в течение 5-ти дней с момента направления документов ЗАКАЗЧИК не подписал акт и не направил мотивированный отказ от подписания акта, услуга считается оказанной, принятой в полном объеме и подлежит оплате. 3.3. {UfCrm8PaymentPoitDoc}',
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
            {
                name: 'Подпись клиента',
                code: DocumentGenerateFieldTemplateCode.ClientSignature,
                templateCode: DocumentGenerateFieldTemplateCode.ClientSignature,
                type: 'string',
            },
            {
                name: 'Email контакта для договора (электронном виде на адрес электронной почты )',
                code: DocumentGenerateFieldTemplateCode.UfCrm8EmailContactForDor,
                templateCode:
                    DocumentGenerateFieldTemplateCode.UfCrm8EmailContactForDor,
                type: 'string',
            },
            ...OwnBankFields,
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
                name: 'Подпись клиента',
                code: DocumentGenerateFieldTemplateCode.ClientSignature,
                templateCode: DocumentGenerateFieldTemplateCode.ClientSignature,
                type: 'string',
            },
            {
                name: 'Если в течение 5-ти дней с момента направления документов ЗАКАЗЧИК не подписал акт и не направил мотивированный отказ от подписания акта, услуга считается оказанной, принятой в полном объеме и подлежит оплате. 3.3. {UfCrm8PaymentPoitDoc}',
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
            {
                name: 'Подпись клиента',
                code: DocumentGenerateFieldTemplateCode.ClientSignature,
                templateCode: DocumentGenerateFieldTemplateCode.ClientSignature,
                type: 'string',
            },
            ...OwnBankFields,
        ],
        forContract: [EContractType.ppk] as EContractType[],
    } as const,

    UP_COMPLECT: {
        id: 242,
        name: 'Договор УП комплектом СДЕЛКА',
        code: 'ContractUPComplectDeal',
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
                name: 'Подпись клиента',
                code: DocumentGenerateFieldTemplateCode.ClientSignature,
                templateCode: DocumentGenerateFieldTemplateCode.ClientSignature,
                type: 'string',
            },
            {
                name: 'Если в течение 5-ти дней с момента направления документов ЗАКАЗЧИК не подписал акт и не направил мотивированный отказ от подписания акта, услуга считается оказанной, принятой в полном объеме и подлежит оплате. 3.3. {UfCrm8PaymentPoitDoc}',
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
            {
                name: 'Подпись клиента',
                code: DocumentGenerateFieldTemplateCode.ClientSignature,
                templateCode: DocumentGenerateFieldTemplateCode.ClientSignature,
                type: 'string',
            },
            ...OwnBankFields,
        ],
        forContract: [EContractType.ppk] as EContractType[],
    } as const,
    UP_VIDEO: {
        id: 240,
        name: 'Договор УП видеозапись СДЕЛКА',
        code: 'ContractUPVideoDeal',
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
                name: 'Подпись клиента',
                code: DocumentGenerateFieldTemplateCode.ClientSignature,
                templateCode: DocumentGenerateFieldTemplateCode.ClientSignature,
                type: 'string',
            },
            {
                name: 'Если в течение 5-ти дней с момента направления документов ЗАКАЗЧИК не подписал акт и не направил мотивированный отказ от подписания акта, услуга считается оказанной, принятой в полном объеме и подлежит оплате. 3.3. {UfCrm8PaymentPoitDoc}',
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
            {
                name: 'Подпись клиента',
                code: DocumentGenerateFieldTemplateCode.ClientSignature,
                templateCode: DocumentGenerateFieldTemplateCode.ClientSignature,
                type: 'string',
            },
            ...OwnBankFields,
        ],
        forContract: [EContractType.up_video] as EContractType[],
    } as const,
    UP_SPECIAL: {
        id: 248,
        name: 'Договор УП Спецпродукт СДЕЛКА',
        code: 'ContractUPSpecialDeal',
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
                name: 'Подпись клиента',
                code: DocumentGenerateFieldTemplateCode.ClientSignature,
                templateCode: DocumentGenerateFieldTemplateCode.ClientSignature,
                type: 'string',
            },
            {
                name: 'Если в течение 5-ти дней с момента направления документов ЗАКАЗЧИК не подписал акт и не направил мотивированный отказ от подписания акта, услуга считается оказанной, принятой в полном объеме и подлежит оплате. 3.3. {UfCrm8PaymentPoitDoc}',
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
            {
                name: 'Подпись клиента',
                code: DocumentGenerateFieldTemplateCode.ClientSignature,
                templateCode: DocumentGenerateFieldTemplateCode.ClientSignature,
                type: 'string',
            },
            ...OwnBankFields,
        ],
        forContract: [EContractType.up_special] as EContractType[],
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
            ...OwnBankFields,
        ],
        forContract: [
            EContractType.seminar,
            EContractType.seminar_ppk,
            EContractType.ppk,
            EContractType.up_complect,
            EContractType.up_video,
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
            ...OwnBankFields,
        ],
        forContract: [
            EContractType.seminar,
            EContractType.seminar_ppk,
            EContractType.ppk,
            EContractType.up_complect,
            EContractType.up_video,
        ] as EContractType[],
    } as const,

    INVOISE_QR_WITH_STAMPS: {
        id: 148,
        name: 'Счет QR с печатью СЕМИНАРЫ СДЕЛКА',
        code: 'InvoiceWithStamps',
        fields: [
            {
                name: 'Реквизиты для счета',
                code: 'InvoiceRq',
                templateCode: 'InvoiceRq',
                type: 'string',
            },
            ...OwnBankFields,
        ],
        forContract: [
            EContractType.seminar,
            EContractType.seminar_ppk,
            EContractType.ppk,
            EContractType.up_complect,
            EContractType.up_video,
        ] as EContractType[],
    } as const,
    INVOISE_QR_WITHOUT_STAMPS: {
        id: 146,
        name: 'Счет QR без печати СЕМИНАРЫ СДЕЛКА',
        code: 'InvoiceWithoutStamps',
        fields: [
            {
                name: 'Реквизиты для счета',
                code: 'InvoiceRq',
                templateCode: 'InvoiceRq',
                type: 'string',
            },
            ...OwnBankFields,
        ],
        forContract: [
            EContractType.seminar,
            EContractType.seminar_ppk,
            EContractType.ppk,
            EContractType.up_complect,
            EContractType.up_video,
        ] as EContractType[],
    } as const,

    ACT: {
        id: 244,
        name: 'УПД',
        code: 'Act',
        fields: [
            {
                name: 'Номер документа самого УПД',
                code: DocumentGenerateFieldTemplateCode.DocumentNumber,
                templateCode: DocumentGenerateFieldTemplateCode.DocumentNumber,
                type: 'string',
            },
            {
                name: 'Дата самого УПД',
                code: DocumentGenerateFieldTemplateCode.ACT_DATE,
                templateCode: DocumentGenerateFieldTemplateCode.ACT_DATE,
                type: 'string',
            },
            {
                name: 'Короткое наименование клиента',
                code: DocumentGenerateFieldTemplateCode.CLIENT_SHORT_NAME,
                templateCode:
                    DocumentGenerateFieldTemplateCode.CLIENT_SHORT_NAME,
                type: 'string',
            },
            {
                name: 'Короткое наименование клиента clientCompanyShortTitle',
                code: DocumentGenerateFieldTemplateCode.CLIENT_SHORT_NAME,
                templateCode:
                    DocumentGenerateFieldTemplateCode.CLIENT_SHORT_NAME,
                type: 'string',
            },

            {
                name: 'Адрес для УПД clientUpdAddress',
                code: DocumentGenerateFieldTemplateCode.CLIENT_SHORT_NAME,
                templateCode:
                    DocumentGenerateFieldTemplateCode.CLIENT_SHORT_NAME,
                type: 'string',
            },
            ...OwnBankFields,
        ],
        forContract: [
            EContractType.seminar,
            EContractType.seminar_ppk,
            EContractType.ppk,
            EContractType.up_complect,
            EContractType.up_video,
        ] as EContractType[],
    } as const,
};

export type DocumentGenerateType = typeof DocumentGenerateTemplatesType;
