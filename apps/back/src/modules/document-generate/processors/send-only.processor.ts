import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { WsService } from '@/core/ws';
import { QueueNames } from '@/modules/queue/constants/queue-names.enum';
import { JobNames } from '@/modules/queue/constants/job-names.enum';
import { TelegramService } from '@/modules/telegram/telegram.service';

import { SendOnlyDto } from '../dto/send-only.dto';
import { SendOnlyUseCase } from '../use-cases/send-only.use-case';

/** Событие, по которому фронт понимает, чем кончилась отправка */
export const SEND_ONLY_WS_EVENT = 'document-send-only:done';

/**
 * Повторная отправка документов — в очереди, а не в обработчике запроса.
 *
 * Она делает три обращения к порталу: читает стадию, ставит контакт,
 * переводит стадию. Портал на это отвечает секундами, а в плохой день —
 * пятисотками: 20.11.2026 с 9:00 до 9:42 он отдавал INTERNAL_SERVER_ERROR
 * на пять разных методов подряд, и повторная отправка по сделке 204878
 * упала на crm.deal.update. Менеджер при этом видел «отправлено».
 *
 * Теперь результат приходит по веб-сокету, и неудача доходит до
 * менеджера явно — с предложением повторить.
 */
@Processor(QueueNames.DOCUMENT)
export class SendOnlyQueueProcessor {
    private readonly logger = new Logger(SendOnlyQueueProcessor.name);

    constructor(
        private readonly useCase: SendOnlyUseCase,
        private readonly ws: WsService,
        private readonly telegram: TelegramService,
    ) {}

    @Process(JobNames.DOCUMENT_SEND_ONLY)
    async handle(job: Job<SendOnlyDto & { socketId?: string }>) {
        const dto = job.data;
        const dealId = Number(dto.dealId);
        const socketId = dto.socketId;

        this.logger.log(`Повторная отправка: сделка ${dealId}`);

        try {
            const result = await this.useCase.sendOnly(dto);

            this.notify(socketId, {
                ...result,
                dealId,
                error: null,
            });

            this.logger.log(
                `Повторная отправка завершена: сделка ${dealId}, отправлено: ${result.sent}`,
            );
        } catch (error) {
            const reason =
                error instanceof Error ? error.message : String(error);

            this.logger.error(
                `Повторная отправка упала: сделка ${dealId} — ${reason}`,
            );

            //Сообщаем именно о неудаче, а не молчим: иначе менеджер решит,
            //что письмо ушло. Повтор не делаем автоматически — портал мог
            //успеть переключить стадию до сбоя, и второй заход отправил бы
            //письмо дважды
            this.notify(socketId, {
                sent: false,
                missing: [],
                contactId: null,
                dealId,
                error: reason,
            });

            await this.telegram
                .sendMessageAdminError(
                    `ALFA SEND ONLY: сделка ${dealId} — повторная отправка не выполнена: ${reason}`,
                )
                .catch(() => undefined);

            throw error;
        }
    }

    /** Упавший веб-сокет не должен ронять задачу: результат уже в портале */
    private notify(socketId: string | undefined, data: unknown) {
        if (!socketId) return;

        try {
            this.ws.sendToClient(socketId, {
                event: SEND_ONLY_WS_EVENT,
                data,
            });
        } catch (error) {
            this.logger.warn(
                `Результат не ушёл клиенту: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        }
    }
}
