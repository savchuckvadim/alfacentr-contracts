import { Injectable } from '@nestjs/common';
import { OnDealInitRequestDto } from '../dto/on-deal-init-request.dto';
import { BxDealService } from '../services/bx-deal.service';

import { DealFieldValuesHelperService } from '../services/deal-helper/deal-values-helper.service';
import { PBXService } from '@/modules/pbx';
import { BxSmartService } from '../services/bx-smart.service';

import { AlfaFieldsService } from '@/modules/alfa-fields';
import { RedisService } from '@/core/redis/redis.service';
import { TDealData } from '@alfa/entities';

@Injectable()
export class FrontDealUseCase {
    private alfaFieldService: AlfaFieldsService;
    private bxDealService: BxDealService;


    constructor(
        private readonly pbx: PBXService,
        private readonly redisService: RedisService,
    ) { }
    async init(domain: string) {
        const { bitrix } = await this.pbx.init(domain);

        // const bxFieldsService = new BxFieldsService();
        this.alfaFieldService = new AlfaFieldsService();
        this.bxDealService = new BxDealService();
        await this.bxDealService.init(bitrix);
        await this.alfaFieldService.init(bitrix);


    }
    async getDealValues(dealId: number) {
        const { bxDealService, alfaFieldService } = {
            bxDealService: this.bxDealService,
            alfaFieldService: this.alfaFieldService,
        };



        const { alfaFieldData, resultBxFieldsIds } = await this.getFieldsIds();
        const deal = await bxDealService.getDeal(dealId, resultBxFieldsIds as string[]);
        if (!deal || !alfaFieldData) {
            return null;
        }
        const dealValues = DealFieldValuesHelperService.getDealValues(
            deal,
            alfaFieldData,
        );
        return dealValues;
    }

    async getFieldsIds() {
        const redisClient = this.redisService.getClient();

        const cachedAlfaFieldData = await redisClient.get(`ALFA fieldData`);
        const cachedBxFieldsIds = await redisClient.get(`ALFA bxFieldsIds`);
        let alfaFieldData = null as TDealData | null;
        let resultBxFieldsIds = [] as string[];
        if (cachedAlfaFieldData && cachedBxFieldsIds) {
            alfaFieldData = JSON.parse(cachedAlfaFieldData);
            resultBxFieldsIds = JSON.parse(cachedBxFieldsIds);
        } else {
            const { fieldData, bxFieldsIds } =
                await this.alfaFieldService.getDealFieldsDataWithIds();
            alfaFieldData = fieldData;
            await redisClient.setex(
                `ALFA fieldData`,
                60 * 10,
                JSON.stringify(alfaFieldData),

            );
            await redisClient.setex(
                `ALFA bxFieldsIds`,
                60 * 10,
                JSON.stringify(bxFieldsIds),

            );
            resultBxFieldsIds = bxFieldsIds;
        }

        return {
            alfaFieldData,
            alfaFieldDataCount: alfaFieldData ? Object.keys(alfaFieldData).length : 0,
            resultBxFieldsIds,
            resultBxFieldsIdsCount: resultBxFieldsIds ? resultBxFieldsIds.length : 0,
        }
    }
}
