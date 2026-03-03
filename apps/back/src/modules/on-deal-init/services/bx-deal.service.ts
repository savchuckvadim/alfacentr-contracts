import { BitrixService } from 'src/modules/bitrix';
import { DealValue } from '../../../lib/deal-helper/deal-values-helper.service';
import { BitrixEntityType } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { BidInfoLayoutService, GetDealBidItemsType } from '@/modules/bid-info-layout/bid-info-layout.service';

export class BxDealService {
    private bitrix: BitrixService;

    constructor() { }

    async init(bitrix: BitrixService) {
        this.bitrix = bitrix;

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
        const bidInfoLayoutService = new BidInfoLayoutService(GetDealBidItemsType.BB);
        const comment = bidInfoLayoutService.getComment(dealValues);


        comment && (await this.setTimelineComment(dealId, comment));
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
