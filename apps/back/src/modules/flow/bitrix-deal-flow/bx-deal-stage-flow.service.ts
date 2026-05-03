import { delay } from '@/lib';
import { BitrixService, IBXDeal } from '@/modules/bitrix';
import { BX_DEAL_STAGES_DATA, DEAL_CATEGORY_ID } from '@alfa/entities';

export class BxDealStageFlowService {
    private dealId: number;
    constructor(
        private readonly bitrix: BitrixService,
        dealId: number,
    ) {
        this.dealId = dealId;
    }

    async changeStageFromDocument() {
        await delay(400);
        const categoryId = String(DEAL_CATEGORY_ID);
        const emailSentStageId = String(BX_DEAL_STAGES_DATA.DOCUMENTS.statusId);
        await this.sendChanges({
            CATEGORY_ID: categoryId,
            STAGE_ID: emailSentStageId,
        });
    }

    async changeStageFromEmailSent() {
        const categoryId = String(DEAL_CATEGORY_ID);
        const emailSentStageId = String(
            BX_DEAL_STAGES_DATA.EMAIL_SENT.statusId,
        );

        await this.sendChanges({
            CATEGORY_ID: categoryId,
            STAGE_ID: emailSentStageId,
        });
    }

    private async sendChanges(data: Partial<IBXDeal>) {

        await this.bitrix.deal.update(this.dealId, data);
    }
}
