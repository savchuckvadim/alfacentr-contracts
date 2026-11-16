import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { QueueNames } from '@/modules/queue/constants/queue-names.enum';
import { JobNames } from '@/modules/queue/constants/job-names.enum';
import { TelegramService } from '@/modules/telegram/telegram.service';

import { OnDealInitUseCase } from '../use-cases/on-deal-init.use-case';
import { OnDealInitRequestDto } from '../dto/on-deal-init-request.dto';
import { DealInitJobData } from '../services/deal-init-job.rules';

/**
 * Приём заявки идёт здесь, а не в обработчике вебхука.
 *
 * Битрикс не ждёт ответа дольше своего таймаута и рвёт соединение: за две
 * недели ноября 2026 так оборвалась четверть вебхуков (65 из 242, в иные
 * дни до 45%), и заявка оставалась пустой до прогона крона подхвата —
 * отсюда жалобы менеджеров на задержку до получаса. Приём тяжёлый:
 * поиск каждого товара, создание участников по одному, поиск компании,
 * синхронизация контакта — всё последовательными вызовами портала по
 * 0.4–4.5 секунды каждый.
 *
 * Теперь вебхук только кладёт задачу и отвечает сразу, а работа идёт
 * здесь. Крон подхвата остаётся страховкой — но уже на случай падения
 * воркера, а не на каждую четвёртую заявку.
 */
@Processor(QueueNames.DEAL_INIT)
export class DealInitProcessor {
    private readonly logger = new Logger(DealInitProcessor.name);

    constructor(
        private readonly onDealInit: OnDealInitUseCase,
        private readonly telegram: TelegramService,
    ) {}

    @Process(JobNames.DEAL_INIT)
    async handle(job: Job<DealInitJobData>): Promise<void> {
        const { dealId, domain } = job.data;
        this.logger.log(`Приём заявки: сделка ${dealId}`);

        try {
            await this.onDealInit.onDealCreate({
                auth: { domain },
                dealId,
            } as OnDealInitRequestDto);

            this.logger.log(`Приём заявки завершён: сделка ${dealId}`);
        } catch (error) {
            const reason =
                error instanceof Error ? error.message : String(error);
            this.logger.error(
                `Приём заявки упал: сделка ${dealId} — ${reason}`,
            );

            //повтора нет: приём не идемпотентен. Сообщаем и оставляем
            //сделку крону подхвата — он проверит, что она правда пустая
            await this.telegram
                .sendMessageAdminError(
                    `ALFA ON DEAL INIT: сделка ${dealId} не принята — ${reason}. Подхватит крон, если сделка осталась пустой.`,
                )
                .catch(() => undefined);

            throw error;
        }
    }
}
