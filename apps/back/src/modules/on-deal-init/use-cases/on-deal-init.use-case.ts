import { Injectable } from "@nestjs/common";
import { OnDealInitRequestDto } from "../dto/on-deal-init-request.dto";
import { BxDealService } from "../services/bx-deal.service";

import { DealFieldValuesHelperService } from "../services/deal-helper/deal-values-helper.service";
import { PBXService } from "@/modules/pbx";
import { BxSmartService } from "../services/bx-smart.service";
import { BxCompanyService } from "../services/bx-company.service";
import { BxDealDataKeys } from "@alfa/entities";
import { AlfaProductService } from "@/modules/alfa-products";
import { AlfaFieldsService } from "@/modules/alfa-fields";

export enum BitrixEntityType {
    DEAL = 'deal',
    COMPANY = 'company',
    CONTACT = 'contact',
    LEAD = 'lead'
}
@Injectable()
export class OnDealInitUseCase {
    constructor(

        private readonly pbx: PBXService


    ) { }
    async init(domain: string) {
        const { bitrix } = await this.pbx.init(domain);
        const bxDealService = new BxDealService();
        // const bxFieldsService = new BxFieldsService();
        const alfaFieldService = new AlfaFieldsService();
        const bxSmartService = new BxSmartService();
        const bxCompanyService = new BxCompanyService(bitrix);
        const bxProductService = new AlfaProductService(bitrix);
        await bxDealService.init(bitrix);
        await alfaFieldService.init(bitrix);
        await bxSmartService.init(bitrix);

        return {
            bitrix,
            bxDealService,
            alfaFieldService,
            bxSmartService,
            bxCompanyService,
            bxProductService
        }
    }
    async onDealCreate(data: OnDealInitRequestDto) {
        const {
            bitrix,
            bxDealService,
            alfaFieldService,
            bxSmartService,
            bxCompanyService,
            bxProductService
        } = await this.init(data.auth.domain);


        const { fieldData, bxFieldsIds } = await alfaFieldService.getDealFieldsDataWithIds();
        const testInn = fieldData[BxDealDataKeys.inn]
        console.log('testInn', testInn)


        const deal = await bxDealService.getDeal(data.dealId, bxFieldsIds);
        const dealValues = DealFieldValuesHelperService.getDealValues(deal, fieldData);

        if (deal && deal.ID) {
            const dealId = deal.ID
            const products = await bxProductService.addPpkProducts(dealId, dealValues)
            await bxSmartService.setParticipantsSmarts(dealValues, dealId)

        }

       
        const inn = dealValues.find(value => value.code === BxDealDataKeys.inn)?.value as string
        console.log('inn', inn)
        deal && deal.ID && await bxDealService.setTimeline(deal.ID, dealValues)
        deal && deal.ID && inn && await bxCompanyService.searchCompany(deal.ID, inn)
        return deal;
    }



}
