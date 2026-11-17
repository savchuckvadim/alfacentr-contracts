import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { QueueNames } from '@/modules/queue/constants/queue-names.enum';
import { JobNames } from '@/modules/queue/constants/job-names.enum';
import { TelegramService } from '@/modules/telegram/telegram.service';

import { OnDealInitUseCase } from '../use-cases/on-deal-init.use-case';
import { OnDealInitRequestDto } from '../dto/on-deal-init-request.dto';
import {
    DEAL_INIT_CONCURRENCY,
    DealInitJobData,
    getSourceLabel,
} from '../services/deal-init-job.rules';
import { DealInitLockService } from '../services/deal-init-lock.service';

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
        private readonly lock: DealInitLockService,
    ) {}

    //concurrency задан явно: по одной заявке за раз. У Bull это и так
    //значение по умолчанию, но здесь оно обязательное, а не удобное —
    //параллельные приёмы одной воронки затирают товары друг друга
    @Process({ name: JobNames.DEAL_INIT, concurrency: DEAL_INIT_CONCURRENCY })
    async handle(job: Job<DealInitJobData>): Promise<void> {
        const { dealId, domain, source } = job.data;
        //по источнику видно, кто успел первым — вебхук или крон. Вебхук
        //портала доходит с задержкой до минут, и без этого в логе не
        //отличить одно от другого
        const from = getSourceLabel(source);

        //замок против приёма внахлёст: задача могла удалиться по
        //removeOnComplete, и тогда jobId повтор уже не отсекает
        if (!(await this.lock.acquire(dealId))) {
            this.logger.warn(
                `Приём пропущен (${from}): сделка ${dealId} уже принимается`,
            );
            return;
        }

        this.logger.log(`Приём заявки (${from}): сделка ${dealId}`);
        const startedAt = Date.now();

        try {
            await this.onDealInit.onDealCreate({
                auth: { domain },
                dealId,
            } as OnDealInitRequestDto);

            //длительность в логе: по ней видно, укладывается ли приём в
            //TTL замка и в окно подхвата, и какие заявки тяжелее прочих
            this.logger.log(
                `Приём завершён (${from}): сделка ${dealId}, ${Date.now() - startedAt} мс`,
            );
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
        } finally {
            //снимаем и после ошибки: иначе крон подхвата пять минут не
            //сможет забрать сделку, которая осталась пустой
            await this.lock.release(dealId);
        }
    }
}
