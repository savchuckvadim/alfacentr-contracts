import { PBXService } from "@/modules/pbx";
import { AlfaBxField } from "@/modules/on-deal-init/type/bx-deal-field.type";
import { AlfaFieldsService } from "../services/alfa-fields.service";
import { TDealData } from '@alfa/entities';
import { Injectable } from "@nestjs/common";

@Injectable()
export class AlfaFieldUseCase {
    constructor(
        private readonly pbx: PBXService
    ) { }

    async getFields(domain: string): Promise<{
        fieldData: TDealData,
        bxFieldsIds: string[]
    }> {
        const { bitrix } = await this.pbx.init(domain);
        const alfaFieldsService = new AlfaFieldsService();
        await alfaFieldsService.init(bitrix);
        const { fieldData, bxFieldsIds } = await alfaFieldsService.getDealFieldsDataWithIds();
        return { fieldData, bxFieldsIds };
    }
}