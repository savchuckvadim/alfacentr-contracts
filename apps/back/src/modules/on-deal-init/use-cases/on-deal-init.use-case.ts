import { Injectable } from '@nestjs/common';
import { OnDealInitRequestDto } from '../dto/on-deal-init-request.dto';
import { BxDealService } from '../services/bx-deal.service';

import { DealFieldValuesHelperService } from '../../../lib/deal-helper/deal-values-helper.service';
import { PBXService } from '@/modules/pbx';
import { BxSmartService } from '../services/bx-smart.service';
import { BxCompanyService } from '../services/bx-company.service';
import { BxDealDataKeys } from '@alfa/entities';
import { AlfaProductService } from '@/modules/alfa-products';
import { AlfaFieldsService } from '@/modules/alfa-fields';
import { InitialBidTypeService } from '../../../lib/deal-helper/initial-contract-type.service';

export enum BitrixEntityType {
    DEAL = 'deal',
    COMPANY = 'company',
    CONTACT = 'contact',
    LEAD = 'lead',
}
@Injectable()
export class OnDealInitUseCase {
    constructor(
        private readonly pbx: PBXService,
        private readonly initialContractTypeService: InitialBidTypeService,
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
            bxProductService,
        };
    }
    async onDealCreate(data: OnDealInitRequestDto) {
        const {
            bxDealService,
            alfaFieldService,
            bxSmartService,
            bxCompanyService,
            bxProductService,
        } = await this.init(data.auth.domain);

        const { fieldData, bxFieldsIds } =
            await alfaFieldService.getDealFieldsDataWithIds();

        const deal = await bxDealService.getDeal(data.dealId, bxFieldsIds);
        const dealValues = DealFieldValuesHelperService.getDealValues(
            deal,
            fieldData,
        );
        await bxDealService.setTimelineInitProccess(data.dealId);
        const contractType =
            this.initialContractTypeService.initialContractType(dealValues);

        //is UP - означает что пришло из формы связанной с УП если true
        //   если false - значит пришло из формы Семинары
        const isUp =
            contractType && this.initialContractTypeService.isUp(contractType);

        if (deal && deal.ID) {
            const dealId = deal.ID;
            if (isUp) {
                //если УП то добавляем продукты связанные с УП
                // todo переделать - товары не добавляем
                // void await bxProductService.addUpProducts(
                //     dealId,
                //     dealValues,
                // );
            } else {
                //если Семинары то добавляем продукты связанные с Семинарами
                void (await bxProductService.addPpkProducts(
                    dealId,
                    dealValues,
                ));
                //добавляем участников
                await bxSmartService.setParticipantsSmarts(dealValues, dealId);
            }
        }

        const inn = dealValues.find(
            (value) => value.code === BxDealDataKeys.inn,
        )?.value as string;

        deal &&
            deal.ID &&
            dealValues &&
            dealValues.length > 0 &&
            (await bxDealService.setTimeline(deal.ID, dealValues));

        deal && deal.ID && (await bxCompanyService.searchCompany(deal.ID, inn));
        return deal;
    }
}
