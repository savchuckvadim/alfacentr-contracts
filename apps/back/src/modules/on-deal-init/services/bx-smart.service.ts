import { BitrixService } from 'src/modules/bitrix';
import { DealValue } from '../../../lib/deal-helper/deal-values-helper.service';
import { EntityTypeIdEnum, IAlfaParticipantSmartItem } from '@alfa/entities';
import { getParticipantValuesFromDeal } from '../../../lib/deal-helper/get-participant-product-values-from-deal.helepr';

export class BxSmartService {
    private bitrix: BitrixService;
    // private smart: IAlfaParticipantSmartItem;
    private entityTypeId: EntityTypeIdEnum = EntityTypeIdEnum.PARTICIPANT;
    constructor() {}

    async init(bitrix: BitrixService) {
        this.bitrix = bitrix;
    }

    /**
     * Возвращает заведённых участников: приём пишет их в таймлайн сделки,
     * иначе смарты создаются молча и при разборе обращений не видно, кого
     * именно завела заявка и не задвоил ли кого повторный приём
     */
    public async setParticipantsSmarts(
        dealValues: DealValue[],
        dealId: number,
    ): Promise<IAlfaParticipantSmartItem[]> {
        const participants = getParticipantValuesFromDeal(dealValues, dealId);
        const created: IAlfaParticipantSmartItem[] = [];

        for (const participant of participants) {
            const item = {
                ...participant,
                ufCrm12DealId: dealId.toString(),
            } as IAlfaParticipantSmartItem;

            await this.add(this.entityTypeId, item);
            created.push(item);
        }

        return created;
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
