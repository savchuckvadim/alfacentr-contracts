import { BitrixService } from 'src/modules/bitrix/';
import { BitrixEnumerationOption, IBXField } from 'src/modules/bitrix/';
import { AlfaBxField } from '../../on-deal-init/type/bx-deal-field.type';

export class BxFieldsService {
    private bitrix: BitrixService;
    constructor() {}
    async init(bitrix: BitrixService) {
        this.bitrix = bitrix;
    }
    /**
     * Все поля сделки с актуальными элементами списков.
     *
     * Раньше здесь стоял userfield.list с filter { SORT: 1 }: SORT — это порядок
     * сортировки поля, а не признак, поэтому в выборку попадали только поля
     * с SORT = 1 (95 из 613). У остальных списки в рантайме не обновлялись,
     * и новые элементы, добавленные в портале, до приложения не доезжали —
     * в заявку и таймлайн уходил голый id элемента вместо названия.
     *
     * Берем два вызова параллельно: userfield.list отдает id, тип, множественность
     * и полные списки, но без названий; crm.deal.fields отдает названия.
     * Это заодно убрало дозапрос userfield.get на каждое поле
     */
    async getDealFields(): Promise<AlfaBxField[]> {
        const [fieldsResponse, listResponse] = await Promise.all([
            this.bitrix.deal.getFields(),
            this.bitrix.deal.getFieldsList({}),
        ]);

        const labels = (fieldsResponse?.result || {}) as Record<
            string,
            { formLabel?: string; title?: string; listLabel?: string }
        >;
        const rows = (listResponse?.result || []) as IBXField[];

        return this.prepareFields(rows, labels);
    }

    private prepareFields(
        fields: IBXField[],
        labels: Record<
            string,
            { formLabel?: string; title?: string; listLabel?: string }
        >,
    ): AlfaBxField[] {
        return fields.map((field) => this.prepareField(field, labels));
    }

    private prepareField(
        field: IBXField,
        labels: Record<
            string,
            { formLabel?: string; title?: string; listLabel?: string }
        >,
    ): AlfaBxField {
        const label = labels[field.FIELD_NAME];

        return {
            id: field.ID,
            bitrixId: field.FIELD_NAME,
            type: field.USER_TYPE_ID,
            list: field.LIST?.map((listItem) =>
                this.prepareFieldList(listItem),
            ),
            //userfield.list названий не отдает, берем их из crm.deal.fields;
            //по названию идет сопоставление полей участников («Участник N»)
            name:
                label?.formLabel ||
                label?.title ||
                label?.listLabel ||
                field.EDIT_FORM_LABEL?.['ru'] ||
                '',
            code: field.XML_ID || '',
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
}
