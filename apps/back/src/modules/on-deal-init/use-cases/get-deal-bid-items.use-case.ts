
import { BxDealService } from '../services/bx-deal.service';
import {
    DealFieldValuesHelperService,
} from '../../../lib/deal-helper/deal-values-helper.service';

import { AlfaFieldsService } from '@/modules/alfa-fields';
import { BitrixService } from '@/modules/bitrix';
import { BidInfoLayoutService, GetDealBidItemsType } from '@/modules/bid-info-layout/bid-info-layout.service';

export enum BitrixEntityType {
    DEAL = 'deal',
    COMPANY = 'company',
    CONTACT = 'contact',
    LEAD = 'lead',
}


export class GetDealBidItemsUseCase {
    // private type: GetDealBidItemsType;
    constructor(private readonly bitrix: BitrixService) { }

    private async init() {
        const bxDealService = new BxDealService();
        const alfaFieldService = new AlfaFieldsService();

        await bxDealService.init(this.bitrix);
        await alfaFieldService.init(this.bitrix);


        return {
            bxDealService,
            alfaFieldService,
        };
    }
    public async getItems(dealId: number) {
        const { bxDealService, alfaFieldService } = await this.init();

        const { fieldData, bxFieldsIds } =
            await alfaFieldService.getDealFieldsDataWithIds();

        const deal = await bxDealService.getDeal(dealId, bxFieldsIds);
        const dealValues = DealFieldValuesHelperService.getDealValues(
            deal,
            fieldData,
        );
        const bidInfoLayoutService = new BidInfoLayoutService(GetDealBidItemsType.HTML);
        const comment = bidInfoLayoutService.getComment(dealValues);

        return comment;
    }


}
