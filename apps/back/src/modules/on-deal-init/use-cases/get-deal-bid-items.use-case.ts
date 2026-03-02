import { Injectable } from '@nestjs/common';
import { BxDealService } from '../services/bx-deal.service';
import {
    DealFieldValuesHelperService,
    DealValue,
} from '../services/deal-helper/deal-values-helper.service';
import { PBXService } from '@/modules/pbx';
import { AlfaFieldsService } from '@/modules/alfa-fields';
import { getIsNotEmptyParticipant } from '../services/deal-helper/get-participant-product-values-from-deal.helepr';
import { BitrixService } from '@/modules/bitrix';
import { BxDealDataKeys } from '@alfa/entities';

export enum BitrixEntityType {
    DEAL = 'deal',
    COMPANY = 'company',
    CONTACT = 'contact',
    LEAD = 'lead',
}
export enum GetDealBidItemsType {
    BB = 'bb',
    HTML = 'html',
    ARRAY = 'array',
}

export enum GetDealBidItemsIconCode {
    FIRST = 'first',
    BID_TYPE = 'bid_type',
    PARTICIPANT = 'participant',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success',
}

export class GetDealBidItemsUseCase {
    private type: GetDealBidItemsType;
    constructor(private readonly bitrix: BitrixService) {}

    private async init(type: GetDealBidItemsType) {
        const bxDealService = new BxDealService();
        const alfaFieldService = new AlfaFieldsService();

        await bxDealService.init(this.bitrix);
        await alfaFieldService.init(this.bitrix);

        this.type = type;
        return {
            bxDealService,
            alfaFieldService,
        };
    }
    public async getItems(dealId: number, type: GetDealBidItemsType) {
        const { bxDealService, alfaFieldService } = await this.init(type);

        const { fieldData, bxFieldsIds } =
            await alfaFieldService.getDealFieldsDataWithIds();

        const deal = await bxDealService.getDeal(dealId, bxFieldsIds);
        const dealValues = DealFieldValuesHelperService.getDealValues(
            deal,
            fieldData,
        );

        const comment = this.getComment(dealValues);

        return comment;
    }

    private getComment(dealValues: DealValue[]) {
        const participants = this.getParticipants(dealValues);
        const info = this.getInfo(dealValues);
        let comment = `${info}\n`;
        for (const participant in participants) {
            comment += participants[participant] + '\n \n';
        }

        return comment;
    }
    private getParticipants(dealValues: DealValue[]) {
        let participants = {} as Record<string, string>;
        let participantsCount = 0;
        dealValues.forEach((value, index) => {
            if (
                value.name.includes('Участник') &&
                value.value &&
                value.value !== '0'
            ) {
                for (let i = 1; i <= 11; i++) {
                    const key = `Участник ${i}`;
                    if (getIsNotEmptyParticipant(dealValues, i)) {
                        const isFirstValue = !participants[i];
                        const isFirst = !participantsCount;

                        if (i === 1) {
                            if (
                                value.name.includes(key) &&
                                !value.name.includes('10')
                            ) {
                                participants[i] = isFirst
                                    ? this.getParticipantItemByType(
                                          i,
                                          value,
                                          isFirst,
                                          isFirstValue,
                                      ) || ''
                                    : participants[i] +
                                          this.getParticipantItemByType(
                                              i,
                                              value,
                                              isFirst,
                                              isFirstValue,
                                          ) || '';
                            }
                        } else {
                            if (value.name.includes(key) && value.value) {
                                participants[i] = isFirst
                                    ? this.getParticipantItemByType(
                                          i,
                                          value,
                                          isFirst,
                                          isFirstValue,
                                      ) || ''
                                    : participants[i]
                                      ? participants[i] +
                                            this.getParticipantItemByType(
                                                i,
                                                value,
                                                isFirst,
                                                isFirstValue,
                                            ) || ''
                                      : this.getParticipantItemByType(
                                            i,
                                            value,
                                            isFirst,
                                            isFirstValue,
                                        ) || '';
                            }
                        }
                        participantsCount++;
                    }
                }
            }
        });
        return participants;
    }
    private getInfo(dealValues: DealValue[]) {
        let info = '';
        const bidTye = dealValues.find(
            (value) => value.code === BxDealDataKeys.bid_type,
        );

        if (bidTye && bidTye.value) {
            const bidTypeFieldName = 'Тип заявки';
            info = this.getInfoItemByType(
                bidTypeFieldName,
                bidTye,
                true,
                GetDealBidItemsIconCode.BID_TYPE,
            );
        }
        dealValues.forEach((value) => {
            if (
                !value.name.includes('Участник') &&
                !value.name.toLowerCase().includes('скрытое') &&
                value.code !== BxDealDataKeys.bid_type
            ) {
                if (value.value) {
                    // if (!info) info = '💡[B]' + 'Информация' + '[/B] \n';
                    // info += '[B]' + value.name + ':[/B] ' + value.value + ' \n';
                    const isFirst = !info;
                    info += this.getInfoItemByType(value.name, value, isFirst);
                }
            }
        });
        return info;
    }

    private getParticipantItemByType(
        key: number,
        value: DealValue,
        isFirstParticipant: boolean,
        isFirstValue: boolean,
    ) {
        let item: string = '';
        const icon = this.getIconByCode(GetDealBidItemsIconCode.PARTICIPANT);
        if (this.type === GetDealBidItemsType.BB) {
            item = `${icon}[B]` + key + '[/B] \n';
            item += '[B]' + value.name + ':[/B] ' + value.value + ' \n';
        } else if (this.type === GetDealBidItemsType.HTML) {
            if (isFirstParticipant) {
                item =
                    '<div style="margin-bottom: 1px; width: 100%; display: flex; justify-content: center; align-items: center;"><h3>' +
                    'Участники' +
                    '</h3></div>';
            }
            if (isFirstValue) {
                item += `<br> <b> Участник ${key}</b> <br>`;
            }
            item += '<p> <b>' + value.name + ':</b> ' + value.value + '</p>';
        } else if (this.type === GetDealBidItemsType.ARRAY) {
            item = value.value.toString();
        }
        return item;
    }
    private getInfoItemByType(
        name: string,
        value: DealValue,
        isFirst: boolean,
        iconCode?: GetDealBidItemsIconCode,
    ) {
        let item: string | string[] = '';
        const icon = iconCode ? this.getIconByCode(iconCode) : '';
        const firstIcon = isFirst
            ? this.getIconByCode(GetDealBidItemsIconCode.FIRST)
            : '';
        if (this.type === GetDealBidItemsType.BB) {
            if (isFirst) {
                item = `${firstIcon}[B] ` + 'Информация' + '[/B] \n';
            }

            item += `${icon}[B] ` + name + ':[/B] ' + value.value + ' \n';
        } else if (this.type === GetDealBidItemsType.HTML) {
            // if (isFirst) {
            //     item = '💡<b>' + 'Информация' + '</b> \n';
            // }

            item += '<li> <b>' + ` ${name}` + ':</b> ' + value.value + '</li>';
        } else if (this.type === GetDealBidItemsType.ARRAY) {
            if (isFirst) {
                item = `${firstIcon}[B]` + 'Информация' + '[/B] \n';
            }

            item += `${icon}[B] ` + name + ':[/B] ' + value.value + ' \n';
        }
        return item;
    }

    private getIconByCode(iconCode: GetDealBidItemsIconCode) {
        switch (iconCode) {
            case GetDealBidItemsIconCode.BID_TYPE:
                return '📌';
            case GetDealBidItemsIconCode.FIRST:
                return '💡';
            case GetDealBidItemsIconCode.PARTICIPANT:
                return '👤';
            case GetDealBidItemsIconCode.INFO:
                return '🧩';
            case GetDealBidItemsIconCode.WARNING:
                return '🚨';
            case GetDealBidItemsIconCode.ERROR:
                return '❌';
            case GetDealBidItemsIconCode.SUCCESS:
                return '✅';
            default:
                return '';
        }
    }
}
