import { Injectable, Logger } from '@nestjs/common';
import { PBXService } from '@/modules/pbx';
import { BxDealContactFlowService } from '@/modules/flow/bitrix-deal-flow/bx-deal-contact-flow.service';
import { BxDealStageFlowService } from '@/modules/flow/bitrix-deal-flow/bx-deal-stage-flow.service';
import { BxTimelineService } from '@/modules/flow/timeline-flow/bx-timeline.service';

import { SendOnlyDto, SendOnlyResult } from '../dto/send-only.dto';
import { DealDocumentReadyService } from '../services/deal-document-ready.service';
import {
    canSendOnly,
    renderMissingForManager,
    toMissingList,
} from '../services/send-only.rules';

const DEFAULT_DOMAIN = 'alfacentr.bitrix24.ru';

/**
 * Повторная отправка уже сформированных документов.
 *
 * Обычная кнопка «Отправить» пересобирает весь пакет заново, а это нужно
 * не всегда: 19.11.2026 по сделке 204568 документы ушли не тому человеку
 * (контакт из заявки вытеснили контакты компании), и переотправить их
 * надо было теми же файлами и с тем же номером договора.
 *
 * Здесь ничего не генерируется: номер, тема письма и файлы берутся из
 * сделки как есть. Делаем только две вещи — ставим правильного получателя
 * и переводим стадию, по которой работает робот отправки.
 */
@Injectable()
export class SendOnlyUseCase {
    private readonly logger = new Logger(SendOnlyUseCase.name);

    constructor(private readonly pbxService: PBXService) {}

    async sendOnly(dto: SendOnlyDto): Promise<SendOnlyResult> {
        const dealId = Number(dto.dealId);
        const { bitrix } = await this.pbxService.init(
            dto.domain || DEFAULT_DOMAIN,
        );

        //Проверяем, что отправлять есть что. Без этого робот отправит
        //письмо с неполным пакетом: для ППК-договоров обязательно ещё и
        //приложение ППК, а его могли не сформировать
        const readyService = new DealDocumentReadyService(bitrix);
        const missing = await readyService.getMissingDocumentFields(
            dealId,
            dto.contractType,
        );

        if (!canSendOnly(missing)) {
            const reason = renderMissingForManager(missing);
            this.logger.warn(`Сделка ${dealId}: отправка отменена. ${reason}`);

            //в таймлайн тоже: менеджер мог нажать кнопку и уйти, а по
            //карточке будет видно, почему письмо не ушло
            await new BxTimelineService(bitrix, Number(dto.userId), dealId)
                .send(
                    `⚠️ [B]Повторная отправка отменена[/B] \n${reason} \nСформируйте документы заново.`,
                    'error',
                )
                .catch(() => undefined);

            return {
                sent: false,
                missing: toMissingList(missing),
                contactId: null,
            };
        }

        //Получателя ставим прямо перед сменой стадии: робот берёт рабочий
        //e-mail последнего контакта сделки, а приём мог привязать его
        //задолго до этого — и связь вытеснили контакты компании
        const contactFlow = new BxDealContactFlowService(bitrix, dealId);
        const { contactId } = await contactFlow.flow({
            email: dto.email,
            name: dto.name || '',
            phone: dto.phone || '',
            userId: Number(dto.userId),
        });

        const timeline = new BxTimelineService(
            bitrix,
            Number(dto.userId),
            dealId,
        );

        const stageFlow = new BxDealStageFlowService(bitrix, dealId);
        await stageFlow.changeStageFromEmailSent();

        this.logger.log(
            `Сделка ${dealId}: документы отправлены повторно, контакт ${contactId}`,
        );

        //Комментарий нужен для разбора обращений: по нему видно, что пакет
        //уходил дважды и кому именно во второй раз
        await timeline
            .send(
                `📧 [B]Повторная отправка документов[/B] \nДокументы не пересобирались — отправлен тот же пакет.`,
                'email',
            )
            .catch(() => undefined);

        return { sent: true, missing: [], contactId };
    }
}
