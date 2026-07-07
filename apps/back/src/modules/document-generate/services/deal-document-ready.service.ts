import { BitrixService } from '@/modules/bitrix';
import {
    dealContractTypeField,
    EContractType,
    getMissingDocumentFields,
    getRequiredDocumentFields,
    IDealRequiredDocumentField,
} from '@alfa/entities';

/**
 * Работа с полями сделки, которые должны содержать сгенерированные документы:
 * очистка перед генерацией и проверка заполненности после
 */
export class DealDocumentReadyService {
    constructor(private readonly bitrix: BitrixService) {}

    /**
     * Очищает в сделке поля, которые должны содержать документы
     * (по типу договора), чтобы после генерации проверка была честной
     */
    async clearDocumentFields(
        dealId: number,
        contractType: EContractType | null | undefined,
    ): Promise<void> {
        const fields = getRequiredDocumentFields(contractType);
        const data = fields.reduce<Record<string, string>>((acc, field) => {
            acc[field.bitrixId] = '';
            return acc;
        }, {});

        void (await this.bitrix.deal.update(dealId, data));
    }

    /**
     * Повторно берет сделку и возвращает список обязательных полей
     * с документами, которые не заполнены
     */
    async getMissingDocumentFields(
        dealId: number,
        contractType?: EContractType | null,
    ): Promise<IDealRequiredDocumentField[]> {
        // выбираем superset полей (как для ППК), тип договора может
        // определяться из самой сделки уже после получения
        const select = [
            'ID',
            dealContractTypeField.bitrixId,
            ...getRequiredDocumentFields(EContractType.ppk).map(
                (field) => field.bitrixId,
            ),
        ];
        const deal = await this.bitrix.deal.get(dealId, select);
        const dealData = deal.result as unknown as Record<string, unknown>;

        return getMissingDocumentFields(dealData, contractType);
    }

    async isDealReadyForSend(
        dealId: number,
        contractType?: EContractType | null,
    ): Promise<boolean> {
        const missing = await this.getMissingDocumentFields(
            dealId,
            contractType,
        );
        return missing.length === 0;
    }
}
