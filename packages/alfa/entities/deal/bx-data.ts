import { BxParticipantsDataKeys } from '../smart/participant.interface';
import { BxParticipantsData } from './bx-participants-data';

export enum BxDealDataKeys {
    // contract_type_enum = 'contract_type_enum',
    prefix = 'prefix',
    inn = 'inn',
    companyName = 'companyName',
    directorPosition = 'directorPosition',
    directorName = 'directorName',
    directorBased = 'directorBased',
    directorPhone = 'directorPhone',
    use_edo = 'use_edo',
    bid_type = 'bid_type',
    // contact_up_doc = 'contact_up_doc',
    exchange_doc_name = 'exchange_doc_name',
    exchange_doc_email = 'exchange_doc_email',
    exchange_doc_phone = 'exchange_doc_phone',
    organization_type = 'organization_type',
    organizationfiz_fio = 'organizationfiz_fio',
    seminar_format = 'seminar_format',
    seminar_up_packet = 'seminar_up_packet',
    participants = 'participants',

    //up
    edo_alternative_address = 'edo_alternative_address',
    up_type = 'up_type',
    up_packet = 'up_packet',

    // fio_recipient_of_up = 'fio_recipient_of_up', //only for fiz
    // phone_recipient_of_up = 'phone_recipient_of_up', //only for fiz
    // email_recipient_of_up = 'email_recipient_of_up', //only for fiz

    up_comment = 'up_comment',

    up_email_for_send = 'up_email_for_send',
    // up_contact_fio = 'up_contact_fio', //only for organizations
    // up_contact_phone = 'up_contact_phone', //only for organizations
    // up_contact_email = 'up_contact_email', //only for organizations
}
export const BxDealData: TDealData = {
    [BxDealDataKeys.prefix]: {
        code: BxDealDataKeys.prefix as const,
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1750061186' as const,
        name: 'ПРЕФИКС' as const,
        type: 'enumeration' as const,
        group: 'company' as const,
        value: '' as string,
        list: [
            {
                bitrixId: '0',
                name: 'Нет' as const,
                sort: '10',
            },
        ],
    },
    [BxDealDataKeys.inn]: {
        code: 'inn' as const,
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1687845131' as const,
        name: 'ИНН' as const,
        type: 'string' as const,
        group: 'company' as const,
        value: '' as string,
    },
    [BxDealDataKeys.companyName]: {
        code: 'companyName' as const,
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1743414243' as const,
        name: 'Наименование компании' as const,
        type: 'string' as const,
        group: 'company' as const,
        value: '' as string,
    },
    [BxDealDataKeys.directorPosition]: {
        code: 'directorPosition' as const,
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1743414340' as const,
        name: 'Должность директора' as const,
        type: 'string' as const,
        group: 'company' as const,
        value: '' as string,
    },
    [BxDealDataKeys.directorName]: {
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1743414391' as const,
        name: 'ФИО директора' as const,
        type: 'string' as const,
        code: 'directorName' as const,
        group: 'company' as const,
        value: '' as string,
    },
    [BxDealDataKeys.directorBased]: {
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1743414441' as const,
        name: 'Руководитель действует на основании' as const,
        type: 'string' as const,
        code: 'directorBased' as const,
        group: 'company' as const,
        value: '' as string,
    },
    [BxDealDataKeys.directorPhone]: {
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1743414493' as const,
        name: 'Телефон директора' as const,
        code: 'directorPhone' as const,
        group: 'company' as const,
        type: 'string' as const,
        value: '' as string,
    },

    // [BxDealDataKeys.contact_up_doc]: {
    //     multiple: false as const,
    //     mandatory: false as const,
    //     bitrixId: 'UF_CRM_1743414644' as const,
    //     name: 'Контактное лицо для направления комплекта документов \"Учетная политика\" (ФИО, мобильный телефон, e-mail)' as const,
    //     type: 'string' as const,
    //     code: 'contact_up_doc' as const,
    //     group: 'contacts' as const,
    //     value: '' as string,
    // },
    [BxDealDataKeys.exchange_doc_name]: {
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1743414485' as const,
        name: 'Контактное лицо для обмена документами (ФИО)' as const,
        type: 'string' as const,
        code: BxDealDataKeys.exchange_doc_name as const,
        group: 'contacts' as const,
        value: '' as string,
    },

    [BxDealDataKeys.exchange_doc_email]: {
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1744112127' as const,
        name: 'Контактное лицо для обмена документами (E-mail)' as const,
        type: 'string' as const,
        code: BxDealDataKeys.exchange_doc_email as const,
        group: 'contacts' as const,
        value: '' as string,
    },
    [BxDealDataKeys.exchange_doc_phone]: {
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1744112153' as const,
        name: 'Контактное лицо для обмена документами (Телефон)' as const,
        type: 'string' as const,
        code: BxDealDataKeys.exchange_doc_phone as const,
        group: 'contacts' as const,
        value: '' as string,
    },

    [BxDealDataKeys.organization_type]: {
        id: '8430' as const,
        bitrixId: 'UF_CRM_1744358047' as const,
        type: 'enumeration' as const,
        list: [
            {
                bitrixId: '18030',
                name: 'Физическое лицо',
                sort: '10',
            },
            {
                bitrixId: '18032',
                name: 'Юридическое лицо',
                sort: '20',
            },
        ] as TFieldItem[],
        name: 'Вы являетесь физическим или юридическим лицом?' as const,
        code: BxDealDataKeys.organization_type as const,
        multiple: false as const,
        mandatory: false as const,
        group: 'organization' as const,
        value: '' as string,
    },
    [BxDealDataKeys.organizationfiz_fio]: {
        id: '8432' as const,
        bitrixId: 'UF_CRM_1744358668' as const,
        type: 'string' as const,
        name: 'ФИО (Физлцо)' as const,
        code: BxDealDataKeys.organizationfiz_fio as const,
        multiple: false as const,
        mandatory: false as const,
        group: 'organization' as const,
        value: '' as string,
    },

    [BxDealDataKeys.seminar_format]: {
        id: '8322',
        bitrixId: 'UF_CRM_1743997299',
        type: 'enumeration',
        list: [
            {
                bitrixId: '17822',
                name: 'Семинар',
                sort: '10',
            },
            {
                bitrixId: '17824',
                name: 'ППК',
                sort: '20',
            },
            {
                bitrixId: '17826',
                name: 'Семинар + ППК',
                sort: '30',
            },
            {
                bitrixId: '17828',
                name: 'УП',
                sort: '40',
            },
        ],
        name: 'Форма регистрации',
        code: BxDealDataKeys.seminar_format,
        multiple: false,
        mandatory: false,
        group: 'seminar',
        value: '' as string,
    },

    //TODO: походу больше не используем
    [BxDealDataKeys.seminar_up_packet]: {
        id: '8468',
        bitrixId: 'UF_CRM_1744363400',
        type: 'enumeration',
        code: BxDealDataKeys.seminar_up_packet,
        list: [
            {
                bitrixId: '18038',
                name: 'Учетная политика 2025',
                sort: '10',
            },
            {
                bitrixId: '18040',
                name: 'Учетная политика 2024/2025',
                sort: '20',
            },
        ],
        name: 'Пакет',
        multiple: false,
        mandatory: false,
        group: 'seminar',
        value: '' as string,
    },
    [BxDealDataKeys.use_edo]: {
        id: '1074',
        bitrixId: 'UF_CRM_1688709423',
        type: 'enumeration',
        code: BxDealDataKeys.use_edo,
        list: [
            {
                bitrixId: '2700',
                name: 'Да, СБИС',
                sort: '10',
            },
            {
                bitrixId: '2702',
                name: 'Да, Диадок',
                sort: '20',
            },
            {
                bitrixId: '18024',
                name: 'Да, Другое',
                sort: '30',
            },
            {
                bitrixId: '2704',
                name: 'Нет',
                sort: '40',
            },
        ],
        name: 'Пользуетесь ли вы эдо',
        multiple: false,
        mandatory: false,
        group: 'seminar',
        value: '' as string,
    },
    //Пользуетесь ли вы эдо

    // [BxDealDataKeys.contract_type_enum]: {
    //     id: '10264',
    //     bitrixId: 'UF_CRM_8_1700638045',
    //     type: 'enumeration',
    //     code: BxDealDataKeys.contract_type_enum,
    //     list: [
    //         {
    //             bitrixId: '20014',
    //             name: 'УП комплектом',
    //             sort: '10',
    //             // xmlId: '35234d4bb375ef35c3dcaa518fba3e20',
    //         },
    //         {
    //             bitrixId: '20016',
    //             name: 'УП видеозапись',
    //             sort: '20',
    //             // xmlId: '0e8e95b4d4ec79de6bccdae28b25a43f',
    //         },
    //         {
    //             bitrixId: '20018',
    //             name: 'Семинар',
    //             sort: '30',
    //             // xmlId: '21c669fbc0b6f641e6c7049934141090',
    //         },
    //         {
    //             bitrixId: '20020',
    //             name: 'Семинар ППК',
    //             sort: '40',
    //             // xmlId: '52a8f9e5b16a8cb9e2df068f2d629a4c',
    //         },
    //         {
    //             bitrixId: '20022',
    //             name: 'ППК',
    //             sort: '50',
    //             // xmlId: '122a585d2820b8cdcee246701a87733b',
    //         },
    //         {
    //             bitrixId: '23548',
    //             name: 'Проживание',
    //             sort: '60',
    //             // xmlId: '0c2cca52dc148cdb95802ce9124a42ad',
    //         },
    //     ],
    //     name: 'Тип',
    //     multiple: false,
    //     mandatory: false,
    //     group: 'seminar',
    //     value: '' as string,
    // },

    [BxDealDataKeys.bid_type]: {
        id: '11746',
        bitrixId: 'UF_CRM_1771410918',
        type: 'enumeration',
        code: BxDealDataKeys.bid_type,
        list: [
            {
                bitrixId: '23630',
                name: 'Семинары',
                sort: '10',
            },
            {
                bitrixId: '23632',
                name: 'Учетная политика',
                sort: '20',
            },
        ],
        name: 'Тип заявки (скрытое)',
        multiple: false,
        mandatory: false,
        group: 'general',
        value: '' as string,
    },
    [BxDealDataKeys.participants]: BxParticipantsData,

    //up
    [BxDealDataKeys.edo_alternative_address]: {
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1688709447' as const,
        name: 'Если Вы не используете ЭДО, укажите, пожалуйста, почтовый адрес для направления оригиналов бухгалтерских документов' as const,
        code: BxDealDataKeys.edo_alternative_address as const,
        group: 'general' as const,
        type: 'string' as const,
        value: '' as string,
    },

    [BxDealDataKeys.up_type]: {
        id: '11738',
        bitrixId: 'UF_CRM_1771299602',
        type: 'enumeration',
        code: BxDealDataKeys.up_type,
        list: [
            {
                bitrixId: '23578',
                name: 'Бюджетное',
                sort: '10',
            },
            {
                bitrixId: '23580',
                name: 'Автономное',
                sort: '20',
            },
            {
                bitrixId: '23582',
                name: 'Казенное',
                sort: '30',
            },
            {
                bitrixId: '23584',
                name: 'Бюджетное для медицинских учреждений',
                sort: '40',
            },
            {
                bitrixId: '23586',
                name: 'Автономное для медицинских учреждений',
                sort: '50',
            },
        ],
        name: 'Тип учетной политики',
        multiple: false,
        mandatory: false,
        group: 'general',
        value: '' as string,
    },

    [BxDealDataKeys.up_packet]: {
        id: '11740',
        bitrixId: 'UF_CRM_1771299911',
        type: 'enumeration',
        code: BxDealDataKeys.up_packet,
        list: [
            {
                bitrixId: '23592',
                name: 'Учетная политика 2024',
                sort: '10',
            },
            {
                bitrixId: '23594',
                name: 'Учетная политика 2025',
                sort: '20',
            },
            {
                bitrixId: '23596',
                name: 'Учетная политика 2026',
                sort: '30',
            },
        ],
        name: 'Пакет УП',
        multiple: true,
        mandatory: false,
        group: 'general',
        value: '' as string,
    },

    // [BxDealDataKeys.fio_recipient_of_up]: {
    //     multiple: false as const,
    //     mandatory: false as const,
    //     bitrixId: 'UF_CRM_1771556135' as const,
    //     name: 'ФИО получателя учетной политики' as const,
    //     code: BxDealDataKeys.fio_recipient_of_up as const,
    //     group: 'up' as const,
    //     type: 'string' as const,
    //     value: '' as string,
    //     isFizOnly: true as const,
    //     isOrgOnly: false as const,
    // },

    // [BxDealDataKeys.email_recipient_of_up]: {
    //     multiple: false as const,
    //     mandatory: false as const,
    //     bitrixId: 'UF_CRM_1771556147' as const,
    //     name: 'E-mail УП' as const,
    //     code: BxDealDataKeys.email_recipient_of_up as const,
    //     group: 'up' as const,
    //     type: 'string' as const,
    //     value: '' as string,
    //     isFizOnly: true as const,
    //     isOrgOnly: false as const,
    // },
    // [BxDealDataKeys.phone_recipient_of_up]: {
    //     multiple: false as const,
    //     mandatory: false as const,
    //     bitrixId: 'UF_CRM_1771556159' as const,
    //     name: 'Телефон УП' as const,
    //     code: BxDealDataKeys.phone_recipient_of_up as const,
    //     group: 'up' as const,
    //     type: 'string' as const,
    //     value: '' as string,
    //     isFizOnly: true as const,
    //     isOrgOnly: false as const,
    // },
    [BxDealDataKeys.up_comment]: {
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1771556171' as const,
        name: 'Комментарий УП' as const,
        code: BxDealDataKeys.up_comment as const,
        group: 'up' as const,
        type: 'string' as const,
        value: '' as string,
        isFizOnly: false as const,
        isOrgOnly: false as const,
    },
    [BxDealDataKeys.up_email_for_send]: {
        multiple: false as const,
        mandatory: false as const,
        bitrixId: 'UF_CRM_1771556547' as const,
        name: 'E-mail для направления комплекта документов "Учетная политика"' as const,
        code: BxDealDataKeys.up_email_for_send as const,
        group: 'up' as const,
        type: 'string' as const,
        value: '' as string,
        isFizOnly: false as const,
        isOrgOnly: false as const,
    },
    // [BxDealDataKeys.up_contact_fio]: {
    //     multiple: false as const,
    //     mandatory: false as const,
    //     bitrixId: 'UF_CRM_1771556190' as const,
    //     name: 'Контактное лицо для обмена документами (ФИО) УП' as const,
    //     code: BxDealDataKeys.up_contact_fio as const,
    //     group: 'up' as const,
    //     type: 'string' as const,
    //     value: '' as string,
    //     isFizOnly: false as const,
    //     isOrgOnly: true as const,
    // },
    // [BxDealDataKeys.up_contact_phone]: {
    //     multiple: false as const,
    //     mandatory: false as const,
    //     bitrixId: 'UF_CRM_1771556213' as const,
    //     name: 'Телефон контактного лица УП' as const,
    //     code: BxDealDataKeys.up_contact_phone as const,
    //     group: 'up' as const,
    //     type: 'string' as const,
    //     value: '' as string,
    //     isFizOnly: false as const,
    //     isOrgOnly: true as const,
    // },
    // [BxDealDataKeys.up_contact_email]: {
    //     multiple: false as const,
    //     mandatory: false as const,
    //     bitrixId: 'UF_CRM_1771556201' as const,
    //     name: 'E-mail контактного лица УП' as const,
    //     code: BxDealDataKeys.up_contact_email as const,
    //     group: 'up' as const,
    //     type: 'string' as const,
    //     value: '' as string,
    //     isFizOnly: false as const,
    //     isOrgOnly: true as const,
    // },
};

export type TFieldItem = {
    bitrixId: string;
    name: string;
    sort: string;
};
export type TField = {
    id?: string;
    bitrixId: string;
    name: string;
    code: string | null;
    multiple: boolean;
    mandatory: boolean;
    group: string;
    value: string | number | string[] | number[];
    type: 'enumeration' | 'string' | 'boolean' | 'date' | 'number' | 'datetime';
    isFizOnly?: boolean;
    isOrgOnly?: boolean;
};
export type TFieldSelect = TField & {
    type: 'enumeration';
    list: TFieldItem[];
};
export interface TDealData {
    // [BxDealDataKeys.contract_type_enum]: TFieldSelect;
    [BxDealDataKeys.prefix]: TFieldSelect;
    [BxDealDataKeys.inn]: TField;
    [BxDealDataKeys.companyName]: TField;
    [BxDealDataKeys.directorPosition]: TField;
    [BxDealDataKeys.directorName]: TField;
    [BxDealDataKeys.directorBased]: TField;
    [BxDealDataKeys.directorPhone]: TField;
    [BxDealDataKeys.use_edo]: TFieldSelect;
    [BxDealDataKeys.bid_type]: TFieldSelect;
    // [BxDealDataKeys.contact_up_doc]: TField;
    [BxDealDataKeys.exchange_doc_name]: TField;
    [BxDealDataKeys.exchange_doc_email]: TField;
    [BxDealDataKeys.exchange_doc_phone]: TField;
    [BxDealDataKeys.organization_type]: TFieldSelect;
    [BxDealDataKeys.organizationfiz_fio]: TField;
    [BxDealDataKeys.seminar_format]: TFieldSelect;
    [BxDealDataKeys.seminar_up_packet]: TFieldSelect;
    [BxDealDataKeys.participants]: {
        1: (typeof BxParticipantsData)[1];
        2: (typeof BxParticipantsData)[2];
        3: (typeof BxParticipantsData)[3];
        4: (typeof BxParticipantsData)[4];
        5: (typeof BxParticipantsData)[5];
        6: (typeof BxParticipantsData)[6];
        7: (typeof BxParticipantsData)[7];
        8: (typeof BxParticipantsData)[8];
        9: (typeof BxParticipantsData)[9];
        10: (typeof BxParticipantsData)[10];
    };
    [BxDealDataKeys.edo_alternative_address]: TField;
    [BxDealDataKeys.up_type]: TFieldSelect;
    [BxDealDataKeys.up_packet]: TFieldSelect;
    // [BxDealDataKeys.fio_recipient_of_up]: TField;
    // [BxDealDataKeys.phone_recipient_of_up]: TField;
    // [BxDealDataKeys.email_recipient_of_up]: TField;
    [BxDealDataKeys.up_comment]: TField;
    [BxDealDataKeys.up_email_for_send]: TField;
    // [BxDealDataKeys.up_contact_fio]: TField;
    // [BxDealDataKeys.up_contact_phone]: TField;
    // [BxDealDataKeys.up_contact_email]: TField;
}
export interface TParticipantData {
    [BxParticipantsDataKeys.name]?: TField;
    [BxParticipantsDataKeys.email]?: TField;
    [BxParticipantsDataKeys.phone]?: TField;
    [BxParticipantsDataKeys.comment]?: TField;
    [BxParticipantsDataKeys.format]?: TField;
    [BxParticipantsDataKeys.format_v2]?: TField;
    [BxParticipantsDataKeys.is_ppk]?: TField;
    [BxParticipantsDataKeys.accountant_gos]?: TField;
    [BxParticipantsDataKeys.accountant_medical]?: TField;
    [BxParticipantsDataKeys.zakupki]?: TField;
    [BxParticipantsDataKeys.kadry]?: TField;
    [BxParticipantsDataKeys.corruption]?: TField;
    [BxParticipantsDataKeys.days]?: TField;
}

// Example usage:
// const bitrixResponse = await fetchBitrixData();
// const updatedDealData = updateDealDataFromBitrixResponse(bitrixResponse);
