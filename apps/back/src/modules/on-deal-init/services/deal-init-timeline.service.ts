import { BitrixService } from 'src/modules/bitrix';
import { BitrixEntityType } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { IAlfaParticipantSmartItem } from '@alfa/entities';

import { DealValue } from '../../../lib/deal-helper/deal-values-helper.service';
import {
    BidInfoLayoutService,
    GetDealBidItemsType,
} from '@/modules/bid-info-layout/bid-info-layout.service';
import { ProductResolveIssue } from '@/modules/alfa-products/services/alfa-product.service';
import { renderIssuesForTimeline } from '@/modules/alfa-products/services/product-resolve-issue.util';

import { renderParticipantsForTimeline } from './deal-init-timeline.render';
import { renderContactSyncIssue } from './contact-sync-issue.render';
import {
    extractEdoComment,
    renderEdoCommentForTimeline,
} from './edo-comment.render';

/**
 * Всё, что приём заявки пишет в таймлайн сделки.
 *
 * Собрано в одном месте: раньше комментарии ставились из BxDealService, а
 * тексты жили в alfa-products — найти, что именно видит менеджер, было
 * негде. Движение участников вообще нигде не отражалось: смарты
 * создавались молча, и при разборе обращений приходилось лезть в логи.
 *
 * Инвариант: запись в таймлайн НИКОГДА не роняет приём заявки. Непоставленный
 * комментарий — это непоставленный комментарий, а не потерянная заявка.
 */
export class DealInitTimelineService {
    private static readonly AUTHOR_ID = '502';

    constructor(private readonly bitrix: BitrixService) {}

    /** Начало приёма: менеджер видит, что заявка взята в работу */
    async start(dealId: number): Promise<void> {
        await this.comment(dealId, '🤖 [B]Начало обработки заявки...[/B] \n');
    }

    /** Разбор заявки: что пришло из формы */
    async bidInfo(dealId: number, dealValues: DealValue[]): Promise<void> {
        if (!dealValues?.length) return;

        const layout = new BidInfoLayoutService(GetDealBidItemsType.BB);
        const comment = layout.getComment(dealValues);
        if (comment) await this.comment(dealId, comment);
    }

    /**
     * Комментарий для сотрудника ОДО, если он пришёл вместе с заявкой.
     *
     * В блок «Информация» не попадает: тот собирается по шаблону полей
     * заявки, а это поле объявлено отдельно, среди полей документа.
     * Пустой комментарий пропускаем — пустого заголовка в карточке не надо.
     */
    async edoComment(
        dealId: number,
        deal: Record<string, unknown> | null | undefined,
    ): Promise<void> {
        const comment = extractEdoComment(deal);
        if (!comment) return;

        await this.comment(dealId, renderEdoCommentForTimeline(comment));
    }

    /** Товары, которые не удалось подобрать — их менеджер добавляет руками */
    async productIssues(
        dealId: number,
        issues: ProductResolveIssue[],
    ): Promise<void> {
        if (!issues?.length) return;
        await this.comment(dealId, renderIssuesForTimeline(issues));
    }

    /**
     * Созданные участники семинара.
     *
     * Нужно для разбора обращений: по комментарию видно, кого именно завела
     * заявка, и сразу понятно, задвоил ли кого-то повторный приём.
     *
     * skipped — участники заявки, которые в сделке уже были. При повторном
     * приёме созданных нет вовсе, и без этого числа комментарий был бы
     * пустым: менеджер не понял бы, сработал приём или нет.
     */
    async participants(
        dealId: number,
        participants: IAlfaParticipantSmartItem[],
        skipped: number = 0,
    ): Promise<void> {
        if (!participants?.length && !skipped) return;
        await this.comment(
            dealId,
            renderParticipantsForTimeline(participants, skipped),
        );
    }

    /**
     * Контакт для отправки документов не создан.
     *
     * Приём из-за этого не падает, но и молчать нельзя: без контакта
     * письмо отправить некому, а заявка выглядит полностью принятой —
     * товары и участники на месте. Раньше отказ портала виден был только
     * в логах контейнера.
     */
    async contactSyncIssue(
        dealId: number,
        email: string,
        error: unknown,
    ): Promise<void> {
        await this.comment(dealId, renderContactSyncIssue(email, error));
    }

    /**
     * Ошибку глушим здесь: у всех вызовов смысл «сообщить менеджеру», и ни
     * один из них не стоит того, чтобы оборвать приём заявки на середине.
     */
    private async comment(dealId: number, comment: string): Promise<void> {
        try {
            await this.bitrix.timeline.addTimelineComment({
                ENTITY_TYPE: BitrixEntityType.DEAL,
                ENTITY_ID: dealId,
                COMMENT: comment,
                AUTHOR_ID: DealInitTimelineService.AUTHOR_ID,
            });
        } catch (error) {
            console.error('DealInitTimelineService', dealId, error);
        }
    }
}
