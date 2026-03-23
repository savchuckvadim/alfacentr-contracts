import { Injectable } from '@nestjs/common';
import { BitrixService } from '@/modules/bitrix/bitrix.service';
import { IBitrixBatchResponseResult } from '@/modules/bitrix/core/interface/bitrix-api.intterface';
import { Bank } from '../../../types/bx-bank.type';

import {
    filterBankFields,
    addMissingBank,
    prepareBankForSave,
} from '../utils/bank.utils';

/**
 * Сервис для работы с банковскими реквизитами
 */
@Injectable()
export class BxRqBankService {
    /**
     * Добавляет batch команду для получения банков реквизита
     */
    addBankBatchCommand(bitrix: BitrixService, requisiteId: number): void {
        bitrix.api.addCmdBatch(
            `bankdetail_${requisiteId}`,
            'crm.requisite.bankdetail.list',
            {
                filter: { ENTITY_ID: requisiteId },
            },
        );
    }

    /**
     * Обрабатывает результаты batch запроса для банков
     */
    processBanksFromBatch(
        batches: IBitrixBatchResponseResult[],
        requisiteId: number,
    ): Bank[] {
        for (const batch of batches) {
            if (!batch?.result) continue;

            for (const [resultKey, resultValue] of Object.entries(
                batch.result,
            )) {
                if (resultKey.includes('bankdetail')) {
                    const banks = resultValue as (
                        | Partial<Bank>
                        | Record<string, unknown>
                    )[];
                    if (banks && Array.isArray(banks) && banks.length > 0) {
                        return banks.map((bank) => new Bank(bank));
                    }
                }
            }
        }
        return [];
    }

    /**
     * Добавляет недостающий банк к реквизиту
     */
    ensureRequiredBank(requisite: any): void {
        addMissingBank(requisite);
    }

    /**
     * Обновляет или создает банк в Bitrix24
     */
    async updateBank(bitrix: BitrixService, bank: Bank): Promise<any> {
        const preparedBank = prepareBankForSave(bank);
        const updateBank = filterBankFields(preparedBank);

        if (preparedBank.ID === null || preparedBank.ID === undefined) {
            const result = await bitrix.api.call(
                'crm.requisite.bankdetail.add',
                {
                    fields: updateBank,
                },
            );
            if (result?.error) {
                return result;
            }
            return { bx_id: result?.result?.[0] };
        } else {
            const result = await bitrix.api.call(
                'crm.requisite.bankdetail.update',
                {
                    id: preparedBank.ID,
                    fields: updateBank,
                },
            );
            if (result?.error) {
                return result;
            }
            return true;
        }
    }
}
