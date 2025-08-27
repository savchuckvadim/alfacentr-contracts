import { Injectable } from '@nestjs/common';
import { BxDealService } from '../services/bx-deal.service';
import { DealFieldValuesHelperService, DealValue } from '../services/deal-helper/deal-values-helper.service';
import { PBXService } from '@/modules/pbx';
import { AlfaFieldsService } from '@/modules/alfa-fields';
import { getIsNotEmptyParticipant } from '../services/deal-helper/get-participant-product-values-from-deal.helepr';
import { BitrixService } from '@/modules/bitrix';

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

export class GetDealBidItemsUseCase {
    private type: GetDealBidItemsType;
    constructor(
        private readonly bitrix: BitrixService
    ) {

    }

    private async init( type: GetDealBidItemsType) {

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
        const {

            bxDealService,
            alfaFieldService,

        } = await this.init(type);

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
        dealValues.forEach((value, index) => {
            if (
                value.name.includes('Участник') &&
                value.value &&
                value.value !== '0'
            ) {
                for (let i = 1; i <= 11; i++) {
                    const key = `Участник ${i}`;
                    if (getIsNotEmptyParticipant(dealValues, i)) {
                        if (i === 1) {
                            if (
                                value.name.includes(key) &&
                                !value.name.includes('10') &&
                                value.value
                            ) {
                                const isFirst = !participants[i];
                                participants[i] = this.getParticipantItemByType(key, value, isFirst);
                            }
                        } else {
                            if (value.name.includes(key) && value.value) {
                                const isFirst = !participants[i];
                                participants[i] = this.getParticipantItemByType(key, value, isFirst);
                            }
                        }
                    }
                }
            }
        });
        return participants;
    }
    private getInfo(dealValues: DealValue[]) {
        let info = '';
        dealValues.forEach((value) => {
            if (!value.name.includes('Участник')) {
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

    private getParticipantItemByType(key: string, value: DealValue, isFirst: boolean) {
        let item: string  = '';
        if (this.type === GetDealBidItemsType.BB) {
            item = '👤[B]' + key + '[/B] \n';
            item +=
                '[B]' +
                value.name +
                ':[/B] ' +
                value.value +
                ' \n';
        } else if (this.type === GetDealBidItemsType.HTML) {
            item = '<li>' + key + ' ' + value.value + '</li>';
        } else if (this.type === GetDealBidItemsType.ARRAY) {
            item = value.value.toString();
        }
        return item;
    }
    private getInfoItemByType(name: string, value: DealValue, isFirst: boolean) {
        let item: string | string[] = '';
        if (this.type === GetDealBidItemsType.BB) {
            if (isFirst) {
                item = '💡[B]' + 'Информация' + '[/B] \n';
            }

            item += '[B]' + name + ':[/B] ' + value.value + ' \n';

        } else if (this.type === GetDealBidItemsType.HTML) {

            if (isFirst) {
                item = '💡<b>' + 'Информация' + '</b> \n';
            }

            item += '<li>' + name + ' ' + value.value + '</li>';
        } else if (this.type === GetDealBidItemsType.ARRAY) {

            if (isFirst) {
                item = '💡[B]' + 'Информация' + '[/B] \n';
            }

            item += '[B]' + name + ':[/B] ' + value.value + ' \n';
        }
        return item;
    }
}
