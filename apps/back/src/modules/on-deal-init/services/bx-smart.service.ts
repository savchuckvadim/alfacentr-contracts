import { BitrixService } from 'src/modules/bitrix';
import { DealValue } from '../../../lib/deal-helper/deal-values-helper.service';
import { EntityTypeIdEnum, IAlfaParticipantSmartItem } from '@alfa/entities';
import { getParticipantValuesFromDeal } from '../../../lib/deal-helper/get-participant-product-values-from-deal.helepr';


export class BxSmartService {
    private bitrix: BitrixService;
    // private smart: IAlfaParticipantSmartItem;
    private entityTypeId: EntityTypeIdEnum = EntityTypeIdEnum.PARTICIPANT;
    constructor() { }

    async init(bitrix: BitrixService) {
        this.bitrix = bitrix;
    }

    public async setParticipantsSmarts(
        dealValues: DealValue[],
        dealId: number,
    ) {
        const participants = getParticipantValuesFromDeal(dealValues, dealId);
        for (const participant of participants) {
            await this.add(this.entityTypeId, {
                ...participant,
                ufCrm12DealId: dealId.toString(),
            } as IAlfaParticipantSmartItem,
            );
        }
    }

    public async getList(entityTypeId: string) {
        const smarts = await this.bitrix.item.list(entityTypeId);

        return smarts;
    }

    private async add(
        entityTypeId: EntityTypeIdEnum,
        item: IAlfaParticipantSmartItem,
    ) {
        const smarts = await this.bitrix.item.add(
            entityTypeId as unknown as string,
            item,
        );

        return smarts;
    }
}
