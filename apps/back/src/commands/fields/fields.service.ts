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
}
