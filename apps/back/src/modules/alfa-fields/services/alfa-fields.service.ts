import { PBXService } from "@/modules/pbx";
import { BxFieldsService } from "./bx-field.service";
import { AlfaBxField } from "@/modules/on-deal-init/type/bx-deal-field.type";
import { TDealData } from "@alfa/entities";
import { DealFieldHelperService } from "@/modules/on-deal-init/services/deal-helper/deal-field-helper.service";
import { BitrixService } from "@/modules/bitrix";


export class AlfaFieldsService {
    private bitrix!: BitrixService


    async init(bitrix: BitrixService) {
        this.bitrix = bitrix;
    }
    async getFields(): Promise<AlfaBxField[]> {
        const bxFieldsService = new BxFieldsService();
        await bxFieldsService.init(this.bitrix);
        const fields = await bxFieldsService.getDealFields();
        return fields;
    }

    async getFieldsData(): Promise<TDealData> {
        const fields = await this.getFields();
        const fieldData = DealFieldHelperService.updateDealDataFromBitrixResponse(fields);
        return fieldData;
    }
    getBxFieldsIdsForSelect(fieldData: TDealData): string[] {
        const bxFieldsIds = DealFieldHelperService.getBxFieldsIdsForSelect(fieldData);
        return bxFieldsIds;
    }

    async getDealFieldsDataWithIds(): Promise<{
        fieldData: TDealData,
        bxFieldsIds: string[]
    }> {
        const fieldData = await this.getFieldsData();
        const bxFieldsIds = this.getBxFieldsIdsForSelect(fieldData);
        return { fieldData, bxFieldsIds };
    }
}