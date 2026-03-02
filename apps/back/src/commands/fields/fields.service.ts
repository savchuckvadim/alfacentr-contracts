import { BitrixService, EBXEntity } from 'src/modules/bitrix/';
import { BitrixEnumerationOption, IBXField } from 'src/modules/bitrix/';

export class FieldsService {
    constructor(private readonly bitrix: BitrixService) {}

    async getDealFields() {
        const list = await this.bitrix.deal.getFieldsList({
            SORT: 10,
        });

        const batchResult = await this.getDetailFields(list.result);
        const rowResults = this.bitrix.api.clearResult(
            batchResult,
        ) as IBXField[];
        const fields = this.prepareFields(rowResults);
        const filtredFields = fields.filter((field) =>
            field.name.includes('Приложение'),
        );
        return { count: filtredFields.length, filtredFields, fields };
    }

    async getBxDealDataFields() {
        const list = await this.bitrix.deal.getFieldsList({
            SORT: 1,
        });

        const batchResult = await this.getDetailFields(list.result);
        const rowResults = this.bitrix.api.clearResult(
            batchResult,
        ) as IBXField[];
        const fields = this.prepareFields(rowResults);
        const filtredFields = fields.filter((field) =>
            field.name.includes('Пользуетесь ли вы'),
        );
        return { count: filtredFields.length, filtredFields, fields };
    }
    async getUserFieldsEnumeration() {
        const list = await this.bitrix.deal.getFieldsList({
            USER_TYPE_ID: 'enumeration',
        });

        return await this.getDetailFields(list.result);
    }

    async getDetailFields(fieldList: IBXField[]) {
        for (const field of fieldList) {
            const cmdCode = `get_field_${field.ID}`;
            this.bitrix.batch.deal.getField(cmdCode, field.ID);
        }
        const result = await this.bitrix.api.callBatchWithConcurrency(3);
        return result;
    }

    private prepareFields(fields: IBXField[]) {
        const result = [] as any[];
        fields.map((field) => {
            // result.push(field)

            result.push(this.prepareField(field));
        });
        return result;
    }
    private prepareField(field: IBXField) {
        return {
            id: field.ID,
            bitrixId: field.FIELD_NAME,
            type: field.USER_TYPE_ID,
            list: field.LIST?.map((listItem) =>
                this.prepareFieldList(listItem),
            ),
            name: field.EDIT_FORM_LABEL['ru'],
            code: field.XML_ID,
            multiple: field.MULTIPLE == 'Y',
            mandatory: field.MANDATORY == 'Y',
        };
    }
    private prepareFieldList(listItem: BitrixEnumerationOption) {
        return {
            bitrixId: listItem.ID,
            name: listItem.VALUE,
            sort: listItem.SORT,
        };
    }

    public async getFieldByBitrixId(bitrixId: string, entity: EBXEntity) {
        // const field = await this.bitrix.userFieldConfig.get(
        //    {
        //     id: bitrixId,
        //     moduleId: 'crm',

        //    }
        // )
        const entityField = await this.bitrix[entity].getFieldsList({
            FIELD_NAME: bitrixId,
        });
        return { entityField };
        // if (entity == EBXEntity.DEAL) {
        //     return await this.bitrix.deal.getField(bitrixId)
        // }
        // return await this.bitrix.company.getField(bitrixId)
    }

    public async getFieldById(id: string, entity: EBXEntity) {
        // const field = await this.bitrix.userFieldConfig.get(
        //    {
        //     id: bitrixId,
        //     moduleId: 'crm',

        //    }
        // )
        const entityField = await this.bitrix[entity].getField(Number(id));
        return { entityField };
        // if (entity == EBXEntity.DEAL) {
        //     return await this.bitrix.deal.getField(bitrixId)
        // }
        // return await this.bitrix.company.getField(bitrixId)
    }

    public async addField(entity: EBXEntity) {
        const field = {
            ENTITY_ID: entity,
            FIELD_NAME: 'ALFA_REGION_COMPANY',
            USER_TYPE_ID: 'enumeration',
            NAME: 'Регион NEW',
            SORT: '1',
            MULTIPLE: 'N',
            MANDATORY: 'N',
            SHOW_FILTER: 'E',
            SHOW_IN_LIST: 'Y',
            EDIT_IN_LIST: 'Y',
            IS_SEARCHABLE: 'N',

            LIST: [
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
            ],
        } as Partial<IBXField>;

        const result = await this.bitrix.company.addField({
            ...field,
            ENTITY_ID: entity,
        });
        return { result };
    }
}
