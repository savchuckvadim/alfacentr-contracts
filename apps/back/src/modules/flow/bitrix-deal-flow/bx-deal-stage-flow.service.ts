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

    /**
     * Повторная отправка: сначала возвращаем сделку на «Документы готовы»,
     * потом снова ставим «Документы отправлены».
     *
     * Робот отправки срабатывает на ПЕРЕХОД между стадиями, а не на их
     * значение. Если сделка уже стоит на «Документы отправлены», повторная
     * установка той же стадии перехода не создаёт — робот молчит, и письмо
     * не уходит. Так и вышло на сделке 204878 (20.11.2026): два нажатия
     * «Отправить повторно», две записи в таймлайне, ни одного письма.
     *
     * Паузу между установками держим заметной: портал обрабатывает смену
     * стадии асинхронно, и две команды подряд он может схлопнуть в одну
     */
    async resendEmail() {
        const categoryId = String(DEAL_CATEGORY_ID);

        await this.sendChanges({
            CATEGORY_ID: categoryId,
            STAGE_ID: String(BX_DEAL_STAGES_DATA.DOCUMENTS.statusId),
        });

        await delay(1500);

        await this.sendChanges({
            CATEGORY_ID: categoryId,
            STAGE_ID: String(BX_DEAL_STAGES_DATA.EMAIL_SENT.statusId),
        });
    }

    private async sendChanges(data: Partial<IBXDeal>) {

        await this.bitrix.deal.update(this.dealId, data);
    }
}
