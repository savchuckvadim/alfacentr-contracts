import { Injectable } from '@nestjs/common';
import { BitrixService } from '@/modules/bitrix/bitrix.service';
import { IBitrixBatchResponseResult } from '@/modules/bitrix/core/interface/bitrix-api.intterface';
import { Address } from '../../../types/bx-address.type';
import {
    TypeIdAddress,
    getTypeIdAddressName,
} from '../../../types/type-id-address.enum';
import {
    filterAddressesByType,
    addMissingAddresses,
    filterAddressFields,
    normalizeAddressTypeId,
    setAddressType,
    RequisiteWithAddress,
} from '../utils/address.utils';

/**
 * Сервис для работы с адресами реквизитов
 */
@Injectable()
export class BxRqAddressService {
    /**
     * Добавляет batch команду для получения адресов реквизита
     */
    addAddressBatchCommand(bitrix: BitrixService, requisiteId: number): void {
        bitrix.api.addCmdBatch(`address_${requisiteId}`, 'crm.address.list', {
            filter: { ENTITY_ID: requisiteId },
        });
    }

    /**
     * Обрабатывает результаты batch запроса для адресов
     */
    processAddressesFromBatch(
        batches: IBitrixBatchResponseResult[],
        requisiteId: number,
    ): Address[] {
        for (const batch of batches) {
            if (!batch?.result) continue;

            for (const [resultKey, resultValue] of Object.entries(
                batch.result,
            )) {
                if (resultKey.includes('address')) {
                    const addresses = resultValue as (
                        | Partial<Address>
                        | Record<string, unknown>
                    )[];
                    if (
                        addresses &&
                        Array.isArray(addresses) &&
                        addresses.length > 0
                    ) {
                        return filterAddressesByType(addresses);
                    }
                }
            }
        }
        return [];
    }

    /**
     * Добавляет недостающие адреса к реквизиту
     */
    ensureRequiredAddresses(
        requisite: RequisiteWithAddress,
        anchorId: number,
        entityId: number,
    ): void {
        addMissingAddresses(requisite, anchorId, entityId);
    }

    /**
     * Обновляет адрес в Bitrix24
     */
    async updateAddress(
        bitrix: BitrixService,
        address: Address,
    ): Promise<boolean> {
        setAddressType(address);
        const typeIdValue = normalizeAddressTypeId(address.TYPE_ID);
        const updateAddress = filterAddressFields(address);
        updateAddress.TYPE_ID = typeIdValue;

        // Получаем список адресов
        const listAddress = await bitrix.api.call('crm.address.list', {
            filter: { ENTITY_ID: address.ENTITY_ID },
        });

        const addressCompany: Address[] = [];
        try {
            if (listAddress?.result?.[0]) {
                for (const adr of listAddress.result) {
                    addressCompany.push(new Address(adr));
                }
            }
        } catch (e) {
            console.error(`error: ${e}`);
        }

        if (addressCompany.length === 0) {
            const result = await bitrix.api.call('crm.address.add', {
                fields: updateAddress,
            });
            if (result?.error) {
                return result;
            }
            return true;
        } else {
            for (const adr of addressCompany) {
                const adrTypeId = normalizeAddressTypeId(adr.TYPE_ID);
                if (adrTypeId === typeIdValue) {
                    const result = await bitrix.api.call('crm.address.update', {
                        fields: updateAddress,
                    });
                    if (result?.error) {
                        return result;
                    }
                    return true;
                }
            }
            const result = await bitrix.api.call('crm.address.add', {
                fields: updateAddress,
            });
            if (result?.error) {
                return result;
            }
            return true;
        }
    }
}
