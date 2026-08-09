import { BitrixService } from '@/modules/bitrix';
import {
    dealContractTypeField,
    EContractType,
    getMissingDocumentFields,
    getRequiredDocumentFields,
    IDealRequiredDocumentField,
} from '@alfa/entities';
import { delay } from '@/lib';
import {
    DOCUMENT_WAIT_INTERVAL_MS,
    DOCUMENT_WAIT_TIMEOUT_MS,
} from '../const/document-wait.const';

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

    /**
     * Ждет, пока битрикс дозаполнит поля сделки документами.
     * Опрашивает сделку до истечения бюджета и возвращает последний список
     * незаполненных полей (пустой — значит все готово).
     * onWaitStart вызывается один раз, только если пришлось реально ждать
     */
    async waitForDocumentFields(
        dealId: number,
        contractType?: EContractType | null,
        onWaitStart?: () => Promise<void>,
        timeoutMs: number = DOCUMENT_WAIT_TIMEOUT_MS,
        intervalMs: number = DOCUMENT_WAIT_INTERVAL_MS,
    ): Promise<IDealRequiredDocumentField[]> {
        const deadline = Date.now() + timeoutMs;
        let missing = await this.getMissingDocumentFields(dealId, contractType);

        if (missing.length > 0 && onWaitStart) {
            await onWaitStart();
        }

        while (missing.length > 0 && Date.now() + intervalMs <= deadline) {
            await delay(intervalMs);
            missing = await this.getMissingDocumentFields(dealId, contractType);
        }

        return missing;
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
