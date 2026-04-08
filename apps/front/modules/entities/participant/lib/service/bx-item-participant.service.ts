import {
    AlfaParticipantSmartItemUserFieldsEnum,
    EntityTypeIdEnum,
} from '@alfa/entities';
import { Bitrix } from '@bitrix/bitrix';
import { BitrixService } from '@bitrix/bitrix.service';
import { IBXItem } from '@bitrix/domain/crm/item/interface/item.interface';

export class BxItemParticipantService {
    private bitrix: BitrixService;
    constructor() {
        this.bitrix = Bitrix.getService();
    }

    public async updateParticipant(
        participantId: number,
        fields: {
            [key in AlfaParticipantSmartItemUserFieldsEnum]?:
                | string
                | string[]
                | boolean
                | number;
        },
    ) {
        const bxResult = await this.bitrix.item.update(
            participantId,
            EntityTypeIdEnum.PARTICIPANT as unknown as string,
            fields,
        );

        return bxResult?.result.item;
    }

    public async deleteParticipant(participantId: number): Promise<boolean> {
        return await this.bitrix.item.delete(
            participantId,
            EntityTypeIdEnum.PARTICIPANT as unknown as string,
        );
    }

    public async getParticipant(
        participantId: number,
    ): Promise<IBXItem | null> {
        return await this.bitrix.item.get(
            participantId,
            EntityTypeIdEnum.PARTICIPANT as unknown as string,
        );
    }

    public async addParticipant(
        fields: Partial<IBXItem>,
    ): Promise<IBXItem | undefined> {
        const response = await this.bitrix.item.add(
            EntityTypeIdEnum.PARTICIPANT as unknown as string,
            fields,
        );
        return response?.item
    }
}
