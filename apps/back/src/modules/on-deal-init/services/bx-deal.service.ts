import { BitrixService } from 'src/modules/bitrix';
import { DealValue } from './deal-helper/deal-values-helper.service';
import { BitrixEntityType } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { getIsNotEmptyParticipant } from './deal-helper/get-participant-product-values-from-deal.helepr';
import {
    GetDealBidItemsType,
    GetDealBidItemsUseCase,
} from '../use-cases/get-deal-bid-items.use-case';

export class BxDealService {
    private bitrix: BitrixService;
    private bidService: GetDealBidItemsUseCase;
    constructor() {}

    async init(bitrix: BitrixService) {
        this.bitrix = bitrix;
        this.bidService = new GetDealBidItemsUseCase(bitrix);
    }

    async getDeal(dealId: number, select: string[] = []) {
        const response = await this.bitrix.deal.get(Number(dealId), select);
        const deal = response.result;

        return deal;
    }
    async setTimelineInitProccess(dealId: number) {
        const comment = '🤖 [B]Начало обработки заявки...[/B] \n';
        await this.setTimelineComment(dealId, comment);
    }
    async setTimeline(dealId: number, dealValues: DealValue[]) {
        //значения попадающие в timeline из заявки
        // при инициализации заявки
        const comment = await this.getComment(dealId);

        comment && (await this.setTimelineComment(dealId, comment));
    }
    async getComment(dealId: number) {
        // const participants = this.getParticipants(dealValues);
        // const info = this.getInfo(dealValues);
        // let comment = `${info}\n`;
        // for (const participant in participants) {
        //     comment += participants[participant] + '\n \n';
        // }
        const comment = await this.bidService.getItems(
            dealId,
            GetDealBidItemsType.BB,
        );
        return comment;
    }
    getParticipants(dealValues: DealValue[]) {
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
                                if (!participants[i])
                                    participants[i] = '👤[B]' + key + '[/B] \n';
                                participants[i] +=
                                    '[B]' +
                                    value.name +
                                    ':[/B] ' +
                                    value.value +
                                    ' \n';
                            }
                        } else {
                            if (value.name.includes(key) && value.value) {
                                if (!participants[i])
                                    participants[i] = '👤[B]' + key + '[/B] \n';
                                participants[i] +=
                                    '[B]' +
                                    value.name +
                                    ':[/B] ' +
                                    value.value +
                                    ' \n';
                            }
                        }
                    }
                }
            }
        });
        return participants;
    }
    getInfo(dealValues: DealValue[]) {
        let info = '';
        dealValues.forEach((value) => {
            if (!value.name.includes('Участник')) {
                if (value.value) {
                    if (!info) info = '💡[B]' + 'Информация' + '[/B] \n';
                    info += '[B]' + value.name + ':[/B] ' + value.value + ' \n';
                }
            }
        });
        return info;
    }
    async setTimelineComment(dealId: number, comment: string) {
        await this.bitrix.timeline.addTimelineComment({
            ENTITY_TYPE: BitrixEntityType.DEAL,
            ENTITY_ID: dealId,
            COMMENT: comment,
            AUTHOR_ID: '502',
        });
    }
}
