import { BitrixService } from 'src/modules/bitrix';
import { DealValue } from './deal-helper/deal-values-helper.service';
import { EntityTypeIdEnum, IAlfaParticipantSmartItem } from '@alfa/entities';

export class BxSmartService {
    private bitrix: BitrixService;
    constructor() {}

    async init(bitrix: BitrixService) {
        this.bitrix = bitrix;
    }

    public async setParticipantsSmarts(participants: DealValue[]) {
        const smarts = await this.bitrix.item.list('1036');

        return smarts;
    }

    public async getList(entityTypeId: string) {
        const smarts = await this.bitrix.item.list(entityTypeId);

        return smarts;
    }

    public async add(
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
