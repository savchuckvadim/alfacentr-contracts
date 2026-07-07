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
import { BxDealContactSyncService } from '../services/bx-deal-contact-sync.service';
import { DealValue } from '../../../lib/deal-helper/deal-values-helper.service';
import { IBXDeal } from '@/modules/bitrix';

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
    ) {}
    async init(domain: string) {
        const { bitrix } = await this.pbx.init(domain);
        const bxDealService = new BxDealService();
        // const bxFieldsService = new BxFieldsService();
        const alfaFieldService = new AlfaFieldsService();
        const bxSmartService = new BxSmartService();
        const bxCompanyService = new BxCompanyService(bitrix);
        const bxProductService = new AlfaProductService(bitrix);
        const bxDealContactSyncService = new BxDealContactSyncService(bitrix);
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
            bxDealContactSyncService,
        };
    }
    async onDealCreate(data: OnDealInitRequestDto) {
        const {
            bxDealService,
            alfaFieldService,
            bxSmartService,
            bxCompanyService,
            bxProductService,
            bxDealContactSyncService,
        } = await this.init(data.auth.domain);

        const { fieldData, bxFieldsIds } =
            await alfaFieldService.getDealFieldsDataWithIds();

        const deal = await bxDealService.getDeal(data.dealId, [
            ...bxFieldsIds,
            'ASSIGNED_BY_ID',
        ]);
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

        deal && deal.ID && (await bxCompanyService.searchCompany(deal, inn));

        //синхронизация контакта сделки по контактным данным из заявки
        deal &&
            deal.ID &&
            (await this.syncDealContact(
                bxDealContactSyncService,
                deal,
                dealValues,
            ));
        return deal;
    }

    private async syncDealContact(
        bxDealContactSyncService: BxDealContactSyncService,
        deal: IBXDeal,
        dealValues: DealValue[],
    ) {
        const getFieldByCode = (code: BxDealDataKeys) => {
            return dealValues.find((value) => value.code === code);
        };
        const emailData = getFieldByCode(BxDealDataKeys.exchange_doc_email);
        const nameData = getFieldByCode(BxDealDataKeys.exchange_doc_name);
        const phoneData = getFieldByCode(BxDealDataKeys.exchange_doc_phone);
        const userId = Number(deal.ASSIGNED_BY_ID ?? 0);

        if (
            !emailData?.value ||
            !nameData?.value ||
            !phoneData?.value ||
            !userId
        ) {
            return;
        }

        try {
            await bxDealContactSyncService.flow({
                dealId: Number(deal.ID),
                email: emailData.value as string,
                name: nameData.value as string,
                phone: phoneData.value as string,
                userId,
            });
        } catch (error) {
            //инициация сделки не должна падать из-за синхронизации контакта
            console.error('syncDealContact error', error);
        }
    }
}
