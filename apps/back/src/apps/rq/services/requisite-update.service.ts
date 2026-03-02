import { BadRequestException, Injectable } from '@nestjs/common';
import { RequisiteService } from './requisite.service';
import { ERQItem } from '../dto/erq-item.dto';
import { ERQAddressItem } from '../dto/erq-address.dto';
import { ERQBankItem } from '../dto/erq-bank.dto';
import { BXRequisiteDTO } from '../types/bx-requisite-dto.type';
import { Address } from '../types/bx-address.type';
import { Bank } from '../types/bx-bank.type';
import { CodesField } from '../dto/codes-field';

import { PresetName } from '../enums/preset-name.enum';
import { AddressFieldCode } from '../enums/address-field-code.enum';
import { BankFieldCode } from '../enums/bank-field-code.enum';
import { TypeIdAddress } from '../types/type-id-address.enum';
import { ErrorMessage } from '../enums/error-message.enum';
import { PresetId } from '../enums/preset-id.enum';
import { BitrixOwnerTypeId } from '@/commands/category/dto/category-response.dto';

@Injectable()
export class RequisiteUpdateService {
    constructor(private readonly requisiteService: RequisiteService) {}

    async updateRequisite(
        erqItem: ERQItem,
        rqId: number | undefined,
        bxRqs: BXRequisiteDTO[],
        companyId: number,
        domain: string,
        presetId: number | undefined,
    ): Promise<ERQItem> {
        if (!erqItem) {
            throw new BadRequestException(ErrorMessage.NOT_FULL_DATA);
        }

        erqItem.bx_id = rqId || null;
        erqItem.preset_id = presetId || null;

        // Создаем словарь для сопоставления кодов с именами атрибутов
        const codeToAttributeMap = this.getCodeToAttributeMap();

        // Обновляем поля в BX реквизите
        const updateRq = bxRqs.find((rq) => Number(rq.ID) === Number(rqId));

        if (!updateRq) {
            throw new BadRequestException(ErrorMessage.NOT_FULL_DATA);
        }

        for (const eventRequisite of erqItem.fields) {
            // Получаем имя атрибута из словаря
            const attributeName = codeToAttributeMap[eventRequisite.code];
            if (attributeName) {
                // Обновляем атрибут объекта bxRq
                (updateRq as any)[attributeName] = eventRequisite.value;
            }

            // Обновляем customFields
            if (updateRq.customFields) {
                for (const customField of updateRq.customFields) {
                    const customXmlId = customField.XML_ID?.trim() || '';
                    if (customXmlId === eventRequisite.code) {
                        customField.value = eventRequisite.value;
                    }
                }
            }
        }

        if (rqId === -1) {
            // Создание нового реквизита
            updateRq.ENTITY_TYPE_ID = 4;
            updateRq.ENTITY_ID = companyId;
            updateRq.PRESET_ID = erqItem.preset_id || PresetId.ORG;

            // Устанавливаем название в зависимости от preset_id
            if (erqItem.preset_id === PresetId.ORG) {
                updateRq.NAME = PresetName.ORGANIZATION;
            } else if (erqItem.preset_id === PresetId.IP) {
                updateRq.NAME = PresetName.IP;
            } else if (erqItem.preset_id === PresetId.FIZ) {
                updateRq.NAME = PresetName.PHYSICAL_PERSON;
            }

            const bx_id = await this.requisiteService.createRq(
                updateRq,
                domain,
                erqItem.preset_id!,
            );

            // if (typeof task === 'string') {
            //     throw new BadRequestException(ErrorMessage.NOT_FULL_DATA);
            // }

            return new ERQItem({ bx_id: bx_id });
        } else {
            // Обновление существующего реквизита
            await this.requisiteService.updateRq(updateRq, rqId!, domain);
        }

        return erqItem;
    }

    async updateAddress(
        addressItem: ERQAddressItem,
        rqId: number,
        companyId: number,
        domain: string,
    ): Promise<boolean> {
        if (!addressItem) {
            throw new BadRequestException('Address item is required');
        }

        const bxAddress = new Address({
            TYPE_ID: addressItem.type_id as TypeIdAddress,
            ENTITY_TYPE_ID: BitrixOwnerTypeId.REQUISITE as number,
            ENTITY_ID: rqId,
            ANCHOR_TYPE_ID: BitrixOwnerTypeId.COMPANY as number,
            ANCHOR_ID: companyId,
        });

        if (!addressItem.fields || !Array.isArray(addressItem.fields)) {
            throw new BadRequestException('Address fields are required');
        }

        for (const field of addressItem.fields) {
            if (field.code === AddressFieldCode.ADDRESS_1) {
                bxAddress.ADDRESS_1 = field.value as string;
            } else if (field.code === AddressFieldCode.ADDRESS_2) {
                bxAddress.ADDRESS_2 = field.value as string;
            } else if (field.code === AddressFieldCode.PROVINCE) {
                bxAddress.PROVINCE = field.value as string;
            } else if (field.code === AddressFieldCode.CITY) {
                bxAddress.CITY = field.value as string;
            } else if (field.code === AddressFieldCode.REGION) {
                bxAddress.REGION = field.value as string;
            } else if (field.code === AddressFieldCode.COUNTRY) {
                bxAddress.COUNTRY = field.value as string;
            } else if (field.code === AddressFieldCode.POSTAL_CODE) {
                bxAddress.POSTAL_CODE = field.value as string;
            }
        }

        return await this.requisiteService.updateAddress(domain, bxAddress);
    }

    async updateBank(
        bankItem: ERQBankItem,
        rqId: number,
        domain: string,
    ): Promise<number> {
        const bxBank = new Bank({
            ID: bankItem.id,
            ENTITY_ID: rqId,
        });

        for (const field of bankItem.fields) {
            if (field.code === BankFieldCode.KC) {
                bxBank.RQ_COR_ACC_NUM = field.value as string;
            } else if (field.code === BankFieldCode.PC) {
                bxBank.RQ_ACC_NUM = field.value as string;
            } else if (field.code === BankFieldCode.BIK) {
                bxBank.RQ_BIK = field.value as string;
            } else if (field.code === BankFieldCode.BANK_ADDRESS) {
                bxBank.RQ_BANK_ADDR = field.value as string;
            } else if (field.code === BankFieldCode.BANK_NAME) {
                bxBank.RQ_BANK_NAME = field.value as string;
            } else if (field.code === BankFieldCode.COMMENTS) {
                bxBank.COMMENTS = field.value as string;
            }
        }

        return await this.requisiteService.updateBank(domain, bxBank);
    }

    private getCodeToAttributeMap(): Record<string, string> {
        const codeToAttributeMap: Record<string, string> = {};
        const codesFieldKeys = Object.keys(CodesField);
        for (const fieldName of codesFieldKeys) {
            if (fieldName === 'constructor' || fieldName === 'prototype') {
                continue;
            }
            const fieldValue = (CodesField as any)[fieldName];
            if (
                fieldValue &&
                fieldValue.code &&
                typeof fieldValue.code === 'string'
            ) {
                codeToAttributeMap[fieldValue.code] = fieldName;
            }
        }
        return codeToAttributeMap;
    }
}
