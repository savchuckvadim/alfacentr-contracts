import { PBXService } from '@/modules/pbx';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IBXField } from '@/modules/bitrix/domain/crm/fields/bx-field.interface';
import { IBXCompany } from '@/modules/bitrix/domain/crm/company/interface/bx-company.interface';
import { delay } from '@/lib';
import fs from 'fs';
import readline from 'readline';

const inputFile = 'companies.jsonl';
const parts = 50;
import { join } from 'path';

type FListItem = {
    ID: string;
    SORT: string;
    VALUE: string;
    DEF: string;
    XML_ID: string;
};
const newField = {
    ID: '10508',
    ENTITY_ID: 'CRM_COMPANY',
    FIELD_NAME: 'UF_CRM_ALFA_REGION_COMPANY',
    USER_TYPE_ID: 'enumeration',
    XML_ID: null,
    SORT: '1',
    MULTIPLE: 'N',
    MANDATORY: 'N',
    SHOW_FILTER: 'N',
    SHOW_IN_LIST: 'Y',
    EDIT_IN_LIST: 'Y',
    IS_SEARCHABLE: 'N',
    SETTINGS: {
        DISPLAY: 'LIST',
        LIST_HEIGHT: 1,
        CAPTION_NO_VALUE: '',
        SHOW_NO_VALUE: 'Y',
    },
    LIST: [
        {
            ID: '20172',
            SORT: '10',
            VALUE: 'Академгородок',
            DEF: 'N',
            XML_ID: 'f01a490c8dd55fc79c143a043dd50b7c',
        },
        {
            ID: '20174',
            SORT: '20',
            VALUE: 'Новосибирск',
            DEF: 'N',
            XML_ID: '00edabf4b655d967c8a1c035dfda442c',
        },
        {
            ID: '20176',
            SORT: '30',
            VALUE: 'НСО',
            DEF: 'N',
            XML_ID: '01a0da8dba075a5c4669959f11307014',
        },
        {
            ID: '20178',
            SORT: '40',
            VALUE: 'Алтайский край_Барнаул',
            DEF: 'N',
            XML_ID: 'c07ee94dcfa0cdf36f5d1e09918b4454',
        },
        {
            ID: '20180',
            SORT: '50',
            VALUE: 'Алтайский край_область',
            DEF: 'N',
            XML_ID: '53f67ae0b21bef6d444f2a730dcf351d',
        },
        {
            ID: '20182',
            SORT: '60',
            VALUE: 'Алтай_2020',
            DEF: 'N',
            XML_ID: '50f9029a5890afd81768f90599a9d0e9',
        },
        {
            ID: '20184',
            SORT: '70',
            VALUE: 'Алтай Республика',
            DEF: 'N',
            XML_ID: '6fbcf1cbe837d8487eac299d40f7a97a',
        },
        {
            ID: '20186',
            SORT: '80',
            VALUE: 'Ангарск',
            DEF: 'N',
            XML_ID: 'efc84ea7e8c9a3a9c7765015187dcf42',
        },
        {
            ID: '20188',
            SORT: '90',
            VALUE: 'Амурская_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: 'aa1d4069fc4804f5ffbd27b803c9a23a',
        },
        {
            ID: '20190',
            SORT: '100',
            VALUE: 'Амурская обл. (Благовещенск)',
            DEF: 'N',
            XML_ID: '348858707c7b1e5c8863a857d37f687d',
        },
        {
            ID: '20192',
            SORT: '110',
            VALUE: 'Архангельск',
            DEF: 'N',
            XML_ID: 'f3a14a0a5848be5766b2eb05d8e25ff7',
        },
        {
            ID: '20194',
            SORT: '120',
            VALUE: 'Архангельск_область',
            DEF: 'N',
            XML_ID: 'e9241c1575cb22f8fd8fce673894d456',
        },
        {
            ID: '20196',
            SORT: '130',
            VALUE: 'Белгород',
            DEF: 'N',
            XML_ID: '2d3d7ed2611c3736a4cf43267ccdbd46',
        },
        {
            ID: '20198',
            SORT: '140',
            VALUE: 'Братск',
            DEF: 'N',
            XML_ID: '93faf543ce1b863f7a0a74e25f091f5e',
        },
        {
            ID: '20200',
            SORT: '150',
            VALUE: 'Бурятия',
            DEF: 'N',
            XML_ID: '5871c3bcbeacd713718e3f0d03219cd5',
        },
        {
            ID: '20202',
            SORT: '160',
            VALUE: 'Вологда',
            DEF: 'N',
            XML_ID: 'c87c788aec9aeaf0e09786acc6916172',
        },
        {
            ID: '20204',
            SORT: '170',
            VALUE: 'Вологодская_Область',
            DEF: 'N',
            XML_ID: 'c72ec106a9459d35c47217ad71c8faf8',
        },
        {
            ID: '20206',
            SORT: '180',
            VALUE: 'Екатеринбург',
            DEF: 'N',
            XML_ID: '985a40287f07b79ee27b9ec7fb236dc2',
        },
        {
            ID: '20208',
            SORT: '190',
            VALUE: 'Екатеринбург_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: 'b4bc7fc04ef94a1e14acf3b6954d0727',
        },
        {
            ID: '20210',
            SORT: '200',
            VALUE: 'Забайкальский край',
            DEF: 'N',
            XML_ID: '54898d1f6fd30b8db5108fb7c03bc829',
        },
        {
            ID: '20212',
            SORT: '210',
            VALUE: 'Иркутск',
            DEF: 'N',
            XML_ID: '18d4253917d18ac352faa59315ab34de',
        },
        {
            ID: '20214',
            SORT: '220',
            VALUE: 'Иркутск_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: 'c445c983a879ad2758d72f80db6e7b02',
        },
        {
            ID: '20216',
            SORT: '230',
            VALUE: 'Калининград',
            DEF: 'N',
            XML_ID: '38d241dd5e856181b1e6f28c83498bd0',
        },
        {
            ID: '20218',
            SORT: '240',
            VALUE: 'Калининград_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: 'dcbed3e38576caacb75cff8f92b0b26e',
        },
        {
            ID: '20220',
            SORT: '250',
            VALUE: 'Камчатский край',
            DEF: 'N',
            XML_ID: 'bc271eccd820606d9050c037b51b6418',
        },
        {
            ID: '20222',
            SORT: '260',
            VALUE: 'Киров',
            DEF: 'N',
            XML_ID: 'e8da2bc281921b04be9c3e0a543ee4d0',
        },
        {
            ID: '20224',
            SORT: '270',
            VALUE: 'Киров_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: 'fe2c10a8e64670115767f89cdf63f30b',
        },
        {
            ID: '20226',
            SORT: '280',
            VALUE: 'Коми',
            DEF: 'N',
            XML_ID: 'e165501d666b0b34d330ddba2cd5bd09',
        },
        {
            ID: '20228',
            SORT: '290',
            VALUE: 'Коми_Область',
            DEF: 'N',
            XML_ID: 'eb0f4c7f2a14836c29972c7cb357e2c6',
        },
        {
            ID: '20230',
            SORT: '300',
            VALUE: 'Красноярск',
            DEF: 'N',
            XML_ID: 'ab553a478b727e2201e88d90691b92c7',
        },
        {
            ID: '20232',
            SORT: '310',
            VALUE: 'Красноярск_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: '69981e51cd21d3cbade403317bda63b8',
        },
        {
            ID: '20234',
            SORT: '320',
            VALUE: 'Кузбасс',
            DEF: 'N',
            XML_ID: 'f3276443b0905f6e9d5ac4dd6068cbca',
        },
        {
            ID: '20236',
            SORT: '330',
            VALUE: 'Кузбасс_2020',
            DEF: 'N',
            XML_ID: '83e892351169c39ebfdd3465f99651bd',
        },
        {
            ID: '20238',
            SORT: '340',
            VALUE: 'Курган',
            DEF: 'N',
            XML_ID: 'c2c764013c472bf2ee67643e1afb1153',
        },
        {
            ID: '20240',
            SORT: '350',
            VALUE: 'Курган_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: '9ebebfa8a9908473f62e5adefacb0ebf',
        },
        {
            ID: '20242',
            SORT: '360',
            VALUE: 'Магадан',
            DEF: 'N',
            XML_ID: 'd8ae921004fb85f2eb4018dbfa69b0c3',
        },
        {
            ID: '20244',
            SORT: '370',
            VALUE: 'Магадан_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: '94f3109e304ef798922e50a639faa952',
        },
        {
            ID: '20246',
            SORT: '380',
            VALUE: 'Мурманск',
            DEF: 'N',
            XML_ID: 'b8d8b32ea7a4f7c704b8f7f441e5fa4a',
        },
        {
            ID: '20248',
            SORT: '390',
            VALUE: 'Мурманск_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: 'c83de37c2191a1b188608e2623371f3e',
        },
        {
            ID: '20250',
            SORT: '400',
            VALUE: 'Омск',
            DEF: 'N',
            XML_ID: 'c01e165d54a53cbd981f4e8d4781e3c3',
        },
        {
            ID: '20252',
            SORT: '410',
            VALUE: 'Омск_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: '36d5919710d921a3bf086f50914b6123',
        },
        {
            ID: '20254',
            SORT: '420',
            VALUE: 'Оренбург',
            DEF: 'N',
            XML_ID: '9cd032f6ac1fd81c301e8530ab74daae',
        },
        {
            ID: '20256',
            SORT: '430',
            VALUE: 'Оренбург_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: 'a605b191297daf3941888fa707d22a60',
        },
        {
            ID: '20258',
            SORT: '440',
            VALUE: 'Пенза',
            DEF: 'N',
            XML_ID: '1af142b30712c4d09963aab3bd105e66',
        },
        {
            ID: '20260',
            SORT: '450',
            VALUE: 'Пенза_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: 'a7f2ad3fe51889426d43e46147e7ba6a',
        },
        {
            ID: '20262',
            SORT: '460',
            VALUE: 'Пермь',
            DEF: 'N',
            XML_ID: '3d963684d28a05f8e6d626d38aef3b24',
        },
        {
            ID: '20264',
            SORT: '470',
            VALUE: 'Пермь_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: '26799e92182c74139bb3acd212539b8d',
        },
        {
            ID: '20266',
            SORT: '480',
            VALUE: 'Приморский край',
            DEF: 'N',
            XML_ID: 'a8d1b25c41add1e42eb76343162462cc',
        },
        {
            ID: '20268',
            SORT: '490',
            VALUE: 'Республика Коми',
            DEF: 'N',
            XML_ID: '01e8eeae814e4d22d982af3f3ee2cdc5',
        },
        {
            ID: '20270',
            SORT: '500',
            VALUE: 'Санкт Петербург',
            DEF: 'N',
            XML_ID: '1281371b133755c6027f737304c761e7',
        },
        {
            ID: '20272',
            SORT: '510',
            VALUE: 'Ленинградская_Обл_2024',
            DEF: 'N',
            XML_ID: '33acdca4581e1335cc7412b88cf2f49f',
        },
        {
            ID: '20274',
            SORT: '520',
            VALUE: 'Самарская_область',
            DEF: 'N',
            XML_ID: '2b92378ef5e7da625f2ff4e9ac84ac99',
        },
        {
            ID: '20276',
            SORT: '530',
            VALUE: 'Саратов',
            DEF: 'N',
            XML_ID: '3f547a1c259f8ee19d47412f68823058',
        },
        {
            ID: '20278',
            SORT: '540',
            VALUE: 'Саратов_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: '194752ce3f2c5112378af495f00bf89c',
        },
        {
            ID: '20280',
            SORT: '550',
            VALUE: 'Сахалинская_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: '3ce0728c614fcbc189e2719676bf6b43',
        },
        {
            ID: '20282',
            SORT: '560',
            VALUE: 'Татарстан',
            DEF: 'N',
            XML_ID: '78603925a98f7984d7e5e87f733174c2',
        },
        {
            ID: '20284',
            SORT: '570',
            VALUE: 'Томск',
            DEF: 'N',
            XML_ID: 'eefb39aace97cc74bfd6309d0be7eeea',
        },
        {
            ID: '20286',
            SORT: '580',
            VALUE: 'Томск_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: '7cafd2a33416ed42c27453f14a7467d3',
        },
        {
            ID: '20288',
            SORT: '590',
            VALUE: 'Томск_2020',
            DEF: 'N',
            XML_ID: '2d2dad3e3f6c3b72f807622d43909643',
        },
        {
            ID: '20290',
            SORT: '600',
            VALUE: 'Тюмень',
            DEF: 'N',
            XML_ID: '7e61815d78cea9f5084cabd60c4500a9',
        },
        {
            ID: '20292',
            SORT: '610',
            VALUE: 'Тюмень_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: '5dab7ef139aac6acf20c723d2b11d083',
        },
        {
            ID: '20294',
            SORT: '620',
            VALUE: 'Тыва',
            DEF: 'N',
            XML_ID: '07cc747f8f6e974de84fc58f1de2940d',
        },
        {
            ID: '20296',
            SORT: '630',
            VALUE: 'Удмуртия',
            DEF: 'N',
            XML_ID: 'd53c58d30241903fbfa1ccf7dfc69f0b',
        },
        {
            ID: '20298',
            SORT: '640',
            VALUE: 'Ульяновская_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: '36b6794ff373472c719d8bb35c8d94f5',
        },
        {
            ID: '20300',
            SORT: '650',
            VALUE: 'Хабаровский край',
            DEF: 'N',
            XML_ID: 'fd12d38e66060dcf3b927f0bd9757a9d',
        },
        {
            ID: '20302',
            SORT: '660',
            VALUE: 'Хакасия',
            DEF: 'N',
            XML_ID: '540dc54a3c4b62b2d48b876ed460caa2',
        },
        {
            ID: '20304',
            SORT: '670',
            VALUE: 'Ханты-Мансийск',
            DEF: 'N',
            XML_ID: '12a16bc71311969562c6a4952cd60b92',
        },
        {
            ID: '20306',
            SORT: '680',
            VALUE: 'Челябинск',
            DEF: 'N',
            XML_ID: 'be04c44757eb9cc792cafdf39850efb4',
        },
        {
            ID: '20308',
            SORT: '690',
            VALUE: 'Челябинск_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: '2286f47ce93e5ba55b2e8096e372c726',
        },
        {
            ID: '20310',
            SORT: '700',
            VALUE: 'Чукотка',
            DEF: 'N',
            XML_ID: 'df927ce47cd55cdbe581cf58fff7f0a7',
        },
        {
            ID: '20312',
            SORT: '710',
            VALUE: 'Ямало-Ненецкий АО',
            DEF: 'N',
            XML_ID: '937abb686b422976b8d85f86e936072b',
        },
        {
            ID: '20314',
            SORT: '720',
            VALUE: 'Ярославль',
            DEF: 'N',
            XML_ID: 'f553ff4cc44d22e45a25177222848124',
        },
        {
            ID: '20316',
            SORT: '730',
            VALUE: 'Ярославль_ОБЛАСТЬ',
            DEF: 'N',
            XML_ID: 'fc8ef1553a0f842bc6eec768d3206ac0',
        },
        {
            ID: '20318',
            SORT: '740',
            VALUE: 'Другое',
            DEF: 'N',
            XML_ID: '013e44830fbea06fb99e0aac7c47de55',
        },
        {
            ID: '20320',
            SORT: '750',
            VALUE: 'База КОММ НСО, Томск, Омск',
            DEF: 'N',
            XML_ID: '71c1ac01aab9d5c88e0bef02c503abf4',
        },
        {
            ID: '20322',
            SORT: '760',
            VALUE: 'ГАРАНТ',
            DEF: 'N',
            XML_ID: '98d33f4b895f9ff163087f492b7c13eb',
        },
        {
            ID: '20324',
            SORT: '770',
            VALUE: 'Республика Саха (Якутия)',
            DEF: 'N',
            XML_ID: '1d4355cadab6384de6f155468dfeed58',
        },
        {
            ID: '20326',
            SORT: '780',
            VALUE: 'Якутск',
            DEF: 'N',
            XML_ID: '46b05f24bf8c7d30c96e5f91f362f229',
        },
        {
            ID: '20328',
            SORT: '790',
            VALUE: 'Тестовый',
            DEF: 'N',
            XML_ID: 'ef4ef32b0428cd29e6cd24ecc9accf5b',
        },
        {
            ID: '20330',
            SORT: '800',
            VALUE: 'Башкортостан(УФА)_2024',
            DEF: 'N',
            XML_ID: 'cbef626ff8c9d630c322dd5729c3f252',
        },
        {
            ID: '20332',
            SORT: '810',
            VALUE: 'Чита',
            DEF: 'N',
            XML_ID: '75bb106144fe9b3a1854749142a2ef17',
        },
        {
            ID: '20334',
            SORT: '820',
            VALUE: 'Барнаул',
            DEF: 'N',
            XML_ID: 'd63ee7ba89b22314716f3945ff9b1433',
        },
        {
            ID: '20336',
            SORT: '830',
            VALUE: 'Абакан',
            DEF: 'N',
            XML_ID: '92a99f56c691b895e9009dcf71b97f52',
        },
        {
            ID: '20338',
            SORT: '840',
            VALUE: 'Нижний Новгород г',
            DEF: 'N',
            XML_ID: 'bf0023288721d18676096baf80c3ac59',
        },
        {
            ID: '20340',
            SORT: '850',
            VALUE: 'Ивановская обл',
            DEF: 'N',
            XML_ID: 'dd8e7b2b9b330d16a926b2298c289f31',
        },
        {
            ID: '20342',
            SORT: '860',
            VALUE: 'Костромская обл',
            DEF: 'N',
            XML_ID: '28df1f73fb12d5e894b54c8a41213604',
        },
        {
            ID: '20344',
            SORT: '870',
            VALUE: 'Коммерческие_Омск',
            DEF: 'N',
            XML_ID: 'fe23e170623fc832aaad03ef90144e6e',
        },
        {
            ID: '20346',
            SORT: '880',
            VALUE: 'Коммерческие_Томск',
            DEF: 'N',
            XML_ID: '9630ff7619ec7201da43dfb11c17e4d2',
        },
        {
            ID: '20348',
            SORT: '890',
            VALUE: 'Коммерческие_Новосибирск',
            DEF: 'N',
            XML_ID: 'f7234a80edb0e460414256d7b32819ff',
        },
    ] as FListItem[],
} as Partial<IBXField>;
const oldList = [
    {
        ID: '136',
        SORT: '10',
        VALUE: 'Академгородок',
        DEF: 'N',
    },
    {
        ID: '132',
        SORT: '20',
        VALUE: 'Новосибирск',
        DEF: 'N',
    },
    {
        ID: '134',
        SORT: '30',
        VALUE: 'НСО',
        DEF: 'N',
    },
    {
        ID: '17574',
        SORT: '40',
        VALUE: 'Алтайский край_Барнаул',
        DEF: 'N',
    },
    {
        ID: '142',
        SORT: '50',
        VALUE: 'Алтайский край_область',
        DEF: 'N',
    },
    {
        ID: '802',
        SORT: '60',
        VALUE: 'Алтай_2020',
        DEF: 'N',
    },
    {
        ID: '1834',
        SORT: '70',
        VALUE: 'Алтай Республика',
        DEF: 'N',
    },
    {
        ID: '942',
        SORT: '80',
        VALUE: 'Ангарск',
        DEF: 'N',
    },
    {
        ID: '1140',
        SORT: '90',
        VALUE: 'Амурская_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '14972',
        SORT: '100',
        VALUE: 'Амурская обл. (Благовещенск)',
        DEF: 'N',
    },
    {
        ID: '17174',
        SORT: '110',
        VALUE: 'Архангельск',
        DEF: 'N',
    },
    {
        ID: '17172',
        SORT: '120',
        VALUE: 'Архангельск_область',
        DEF: 'N',
    },
    {
        ID: '884',
        SORT: '130',
        VALUE: 'Белгород',
        DEF: 'N',
    },
    {
        ID: '1444',
        SORT: '140',
        VALUE: 'Братск',
        DEF: 'N',
    },
    {
        ID: '996',
        SORT: '150',
        VALUE: 'Бурятия',
        DEF: 'N',
    },
    {
        ID: '17190',
        SORT: '160',
        VALUE: 'Вологда',
        DEF: 'N',
    },
    {
        ID: '17188',
        SORT: '170',
        VALUE: 'Вологодская_Область',
        DEF: 'N',
    },
    {
        ID: '1010',
        SORT: '180',
        VALUE: 'Екатеринбург',
        DEF: 'N',
    },
    {
        ID: '1012',
        SORT: '190',
        VALUE: 'Екатеринбург_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '874',
        SORT: '200',
        VALUE: 'Забайкальский край',
        DEF: 'N',
    },
    {
        ID: '864',
        SORT: '210',
        VALUE: 'Иркутск',
        DEF: 'N',
    },
    {
        ID: '834',
        SORT: '220',
        VALUE: 'Иркутск_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1360',
        SORT: '230',
        VALUE: 'Калининград',
        DEF: 'N',
    },
    {
        ID: '1362',
        SORT: '240',
        VALUE: 'Калининград_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1120',
        SORT: '250',
        VALUE: 'Камчатский край',
        DEF: 'N',
    },
    {
        ID: '1400',
        SORT: '260',
        VALUE: 'Киров',
        DEF: 'N',
    },
    {
        ID: '1402',
        SORT: '270',
        VALUE: 'Киров_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '17184',
        SORT: '280',
        VALUE: 'Коми',
        DEF: 'N',
    },
    {
        ID: '17186',
        SORT: '290',
        VALUE: 'Коми_Область',
        DEF: 'N',
    },
    {
        ID: '796',
        SORT: '300',
        VALUE: 'Красноярск',
        DEF: 'N',
    },
    {
        ID: '818',
        SORT: '310',
        VALUE: 'Красноярск_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '198',
        SORT: '320',
        VALUE: 'Кузбасс',
        DEF: 'N',
    },
    {
        ID: '804',
        SORT: '330',
        VALUE: 'Кузбасс_2020',
        DEF: 'N',
    },
    {
        ID: '1186',
        SORT: '340',
        VALUE: 'Курган',
        DEF: 'N',
    },
    {
        ID: '1188',
        SORT: '350',
        VALUE: 'Курган_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1114',
        SORT: '360',
        VALUE: 'Магадан',
        DEF: 'N',
    },
    {
        ID: '1136',
        SORT: '370',
        VALUE: 'Магадан_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1014',
        SORT: '380',
        VALUE: 'Мурманск',
        DEF: 'N',
    },
    {
        ID: '1016',
        SORT: '390',
        VALUE: 'Мурманск_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '138',
        SORT: '400',
        VALUE: 'Омск',
        DEF: 'N',
    },
    {
        ID: '810',
        SORT: '410',
        VALUE: 'Омск_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1190',
        SORT: '420',
        VALUE: 'Оренбург',
        DEF: 'N',
    },
    {
        ID: '1192',
        SORT: '430',
        VALUE: 'Оренбург_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1396',
        SORT: '440',
        VALUE: 'Пенза',
        DEF: 'N',
    },
    {
        ID: '1398',
        SORT: '450',
        VALUE: 'Пенза_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1392',
        SORT: '460',
        VALUE: 'Пермь',
        DEF: 'N',
    },
    {
        ID: '1394',
        SORT: '470',
        VALUE: 'Пермь_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1018',
        SORT: '480',
        VALUE: 'Приморский край',
        DEF: 'N',
    },
    {
        ID: '1158',
        SORT: '490',
        VALUE: 'Республика Коми',
        DEF: 'N',
    },
    {
        ID: '1640',
        SORT: '500',
        VALUE: 'Санкт Петербург',
        DEF: 'N',
    },
    {
        ID: '17196',
        SORT: '510',
        VALUE: 'Ленинградская_Обл_2024',
        DEF: 'N',
    },
    {
        ID: '998',
        SORT: '520',
        VALUE: 'Самарская_область',
        DEF: 'N',
    },
    {
        ID: '1404',
        SORT: '530',
        VALUE: 'Саратов',
        DEF: 'N',
    },
    {
        ID: '1406',
        SORT: '540',
        VALUE: 'Саратов_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1138',
        SORT: '550',
        VALUE: 'Сахалинская_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1142',
        SORT: '560',
        VALUE: 'Татарстан',
        DEF: 'N',
    },
    {
        ID: '140',
        SORT: '570',
        VALUE: 'Томск',
        DEF: 'N',
    },
    {
        ID: '812',
        SORT: '580',
        VALUE: 'Томск_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '806',
        SORT: '590',
        VALUE: 'Томск_2020',
        DEF: 'N',
    },
    {
        ID: '1000',
        SORT: '600',
        VALUE: 'Тюмень',
        DEF: 'N',
    },
    {
        ID: '1002',
        SORT: '610',
        VALUE: 'Тюмень_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1004',
        SORT: '620',
        VALUE: 'Тыва',
        DEF: 'N',
    },
    {
        ID: '1198',
        SORT: '630',
        VALUE: 'Удмуртия',
        DEF: 'N',
    },
    {
        ID: '1908',
        SORT: '640',
        VALUE: 'Ульяновская_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1194',
        SORT: '650',
        VALUE: 'Хабаровский край',
        DEF: 'N',
    },
    {
        ID: '902',
        SORT: '660',
        VALUE: 'Хакасия',
        DEF: 'N',
    },
    {
        ID: '1182',
        SORT: '670',
        VALUE: 'Ханты-Мансийск',
        DEF: 'N',
    },
    {
        ID: '1364',
        SORT: '680',
        VALUE: 'Челябинск',
        DEF: 'N',
    },
    {
        ID: '1366',
        SORT: '690',
        VALUE: 'Челябинск_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '1180',
        SORT: '700',
        VALUE: 'Чукотка',
        DEF: 'N',
    },
    {
        ID: '1172',
        SORT: '710',
        VALUE: 'Ямало-Ненецкий АО',
        DEF: 'N',
    },
    {
        ID: '1006',
        SORT: '720',
        VALUE: 'Ярославль',
        DEF: 'N',
    },
    {
        ID: '1008',
        SORT: '730',
        VALUE: 'Ярославль_ОБЛАСТЬ',
        DEF: 'N',
    },
    {
        ID: '144',
        SORT: '740',
        VALUE: 'Другое',
        DEF: 'N',
    },
    {
        ID: '1456',
        SORT: '750',
        VALUE: 'База КОММ НСО, Томск, Омск',
        DEF: 'N',
    },
    {
        ID: '1934',
        SORT: '760',
        VALUE: 'ГАРАНТ',
        DEF: 'N',
    },
    {
        ID: '1116',
        SORT: '770',
        VALUE: 'Республика Саха (Якутия)',
        DEF: 'N',
    },
    {
        ID: '13768',
        SORT: '780',
        VALUE: 'Якутск',
        DEF: 'N',
    },
    {
        ID: '15654',
        SORT: '790',
        VALUE: 'Тестовый',
        DEF: 'N',
    },
    {
        ID: '17194',
        SORT: '800',
        VALUE: 'Башкортостан(УФА)_2024',
        DEF: 'N',
    },
    {
        ID: '19946',
        SORT: '810',
        VALUE: 'Чита',
        DEF: 'N',
    },
    {
        ID: '19948',
        SORT: '820',
        VALUE: 'Барнаул',
        DEF: 'N',
    },
    {
        ID: '19950',
        SORT: '830',
        VALUE: 'Абакан',
        DEF: 'N',
    },
    {
        ID: '19952',
        SORT: '840',
        VALUE: 'Нижний Новгород г',
        DEF: 'N',
    },
    {
        ID: '20120',
        SORT: '850',
        VALUE: 'Ивановская обл',
        DEF: 'N',
    },
    {
        ID: '20122',
        SORT: '860',
        VALUE: 'Костромская обл',
        DEF: 'N',
    },
    {
        ID: '20130',
        SORT: '870',
        VALUE: 'Коммерческие_Омск',
        DEF: 'N',
    },
    {
        ID: '20132',
        SORT: '880',
        VALUE: 'Коммерческие_Томск',
        DEF: 'N',
    },
    {
        ID: '20134',
        SORT: '890',
        VALUE: 'Коммерческие_Новосибирск',
        DEF: 'N',
    },
] as FListItem[];
@ApiTags('Alfa Company')
@Controller('alfa-company')
export class AlfaCompanyController {
    constructor(private readonly pbx: PBXService) {}

    @Get('old-region-get')
    async getCompany() {
        let condition = true;
        const { bitrix } = await this.pbx.init('alfacentr.bitrix24.ru');
        const results = [] as Partial<IBXCompany>[];
        let lastId = 475544;
        // // очищаем/создаем файл
        // fs.writeFileSync('companies.json', '');

        while (condition) {
            const resp = await bitrix.company.getList(
                {
                    '>ID': lastId,
                    ['@UF_CRM_1548909009']: oldList.map((item) => item.ID),
                },
                [
                    'ID',
                    'UF_CRM_ALFA_REGION_COMPANY',
                    'UF_CRM_1548909009',
                    'TITLE',
                ],
                {
                    ID: 'ASC',
                },
            );

            if (resp && resp.result) {
                for (const key in resp.result) {
                    const element = resp.result[key];
                    // results.push(element);
                    await fs.appendFileSync(
                        'companies.json',
                        JSON.stringify(element) + '\n',
                    );
                    lastId = element.ID;
                }
            }
            if (!resp.result || !resp.result.length) {
                condition = false;
            }
            await delay(3500);
        }
        return { count: results.length };
    }

    @Get('update-companies')
    async updateCompanies() {
        const { bitrix } = await this.pbx.init('alfacentr.bitrix24.ru');
        const updateCompany = (companyId: number, regionId: number) => {
            const regionValue = oldList?.find(
                (item) => Number(item.ID) === regionId,
            )?.VALUE;
            if (!regionValue) {
                return;
            }
            const newRegionId = newField.LIST?.find(
                (item) => item.VALUE === regionValue,
            )?.ID;
            if (newRegionId) {
                bitrix.batch.company.update(`update_${companyId}`, companyId, {
                    UF_CRM_ALFA_REGION_COMPANY: newRegionId,
                    UF_CRM_1756747691: '13',
                });
            } else {
            }
        };

        let results = [] as Partial<IBXCompany>[];
        let totalCount = 0;
        let count = 0;

        for (let i = 49; i < 50; i += 1) {
            const data = fs.readFileSync(`data_part_${i + 1}.jsonl`, 'utf8');
            const arr = data
                .trim()
                .split('\n') // каждую строку отдельно
                .map((line) => JSON.parse(line)); // парсим JSON
            // const filtred = arr.filter(item => Number(item.ID) < Number('48'));
            // console.log(filtred);

            for (const item of arr) {
                let rand = Math.random() * 10;
                // if (Number(item.ID) <= 477726) {

                //     continue
                // }
                // if ([
                //     172772, 173296, 173864, 174294, 174966,
                //     175440, 175974, 176476, 176772, 177006

                // ].includes(Number(item.ID))) {
                //     console.log('callBatchWithConcurrency')
                //     console.log('companyId', item.ID)
                //     await delay(9000)
                // }

                // const array = arr.map(item => {

                const path = join('storage', 'results.json');

                updateCompany(Number(item.ID), Number(item.UF_CRM_1548909009));
                totalCount++;

                count++;
                if (count >= 10) {
                    if (rand > 9) {
                        await delay(15000);
                    }

                    await bitrix.api.callBatchWithConcurrency(1);
                    count = 0;
                    await delay(13000);
                }
                fs.appendFileSync(
                    path,
                    JSON.stringify({ ...item, file: i + 1 }) + '\n',
                );

                // });
            }
        }

        return { totalCount }; // 97 609 (fact97504) ..   122 504
        // разбиваем по строкам и парсим каждую

        // async function splitJsonl() {
        //     // Считаем количество строк
        //     const lineReader = readline.createInterface({
        //         input: fs.createReadStream(inputFile),
        //     });

        //     let totalLines = 0;
        //     for await (const _ of lineReader) {
        //         totalLines++;
        //     }

        //     const linesPerFile = Math.ceil(totalLines / parts);
        //     console.log(`Всего строк: ${totalLines}, на файл: ${linesPerFile}`);

        //     // Читаем снова и пишем чанками
        //     const reader = readline.createInterface({
        //         input: fs.createReadStream(inputFile),
        //     });

        //     let fileIndex = 0;
        //     let lineCount = 0;
        //     let writer = fs.createWriteStream(`data_part_${fileIndex + 1}.jsonl`);

        //     for await (const line of reader) {
        //         writer.write(line + "\n");
        //         lineCount++;

        //         if (lineCount >= linesPerFile && fileIndex < parts - 1) {
        //             writer.end();
        //             fileIndex++;
        //             writer = fs.createWriteStream(`data_part_${fileIndex + 1}.jsonl`);
        //             lineCount = 0;
        //         }
        //     }

        //     writer.end();
        //     console.log(`Файл разбит на ${parts} частей.`);
        // }

        // await splitJsonl().catch(console.error);

        // return { count: array.length, array };
    }

    @Get('restore-companies')
    async restoreCompanies() {
        async function splitJsonl() {
            // Считаем количество строк
            const lineReader = readline.createInterface({
                input: fs.createReadStream(inputFile),
            });

            let totalLines = 0;
            for await (const _ of lineReader) {
                totalLines++;
            }

            const linesPerFile = Math.ceil(totalLines / parts);

            // Читаем снова и пишем чанками
            const reader = readline.createInterface({
                input: fs.createReadStream(inputFile),
            });

            let fileIndex = 0;
            let lineCount = 0;
            let writer = fs.createWriteStream(
                `data_part_${fileIndex + 1}.jsonl`,
            );

            for await (const line of reader) {
                writer.write(line + '\n');
                lineCount++;

                if (lineCount >= linesPerFile && fileIndex < parts - 1) {
                    writer.end();
                    fileIndex++;
                    writer = fs.createWriteStream(
                        `data_part_${fileIndex + 1}.jsonl`,
                    );
                    lineCount = 0;
                }
            }

            writer.end();
        }

        await splitJsonl().catch(console.error);

        // return { count: array.length, array };
    }
}
