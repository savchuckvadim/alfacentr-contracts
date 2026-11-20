import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PBXService } from '@/modules/pbx';
import { TelegramService } from '@/modules/telegram/telegram.service';
import { DealInitSource } from '@/modules/on-deal-init/services/deal-init-job.rules';
import { DealInitEnqueueService } from '@/modules/on-deal-init/services/deal-init-enqueue.service';
import {
    DealInitRecoveryResult,
    DealInitRecoveryService,
} from '../services/deal-init-recovery.service';
import { PROJECT_TIME_ZONE } from '@/lib/utils/project-time.util';

const DEFAULT_DOMAIN = 'alfacentr.bitrix24.ru';

/**
 * Подстраховка приема заявок: если вебхук из бизнес-процесса не дошел
 * до сервера, сделка остается пустой, а флаг портала все равно встает —
 * БП #828 ставит «Заявка обработана» сразу после отправки, не дожидаясь
 * ответа. Крон раз в четверть часа сам находит такие сделки и прогоняет
 * их через ту же точку входа, что и вебхук
 */
@Injectable()
export class DealInitRecoveryUseCase {
    constructor(
        private readonly pbx: PBXService,
        private readonly telegram: TelegramService,
        private readonly dealInitEnqueue: DealInitEnqueueService,
    ) {}

    //каждые 3 минуты: вебхук инициации стал регулярно не доходить, и при
    //прежних 15 минутах заявка ждала подхвата до получаса (жалоба
    //менеджеров 16.11.2026). Прогон дешевый: один crm.deal.list, а когда
    //кандидатов нет — ни одного запроса больше и ни одного сообщения.
    //пояс на минутном расписании ни на что не влияет, но держим его тем
    //же, что и у остальных задач проекта
    @Cron('0 */3 * * * *', {
        name: 'deal-init-recovery',
        timeZone: PROJECT_TIME_ZONE,
    })
    async handleCron(): Promise<void> {
        try {
            const result = await this.run();
            //молчим, если нового нет: иначе канал зарастет отчетами. Сделки,
            //по которым задача уже идёт, не считаются — 20.11.2026 один и
            //тот же отчёт про четыре заявки приходил каждые три минуты
            if (
                result.processed ||
                result.markedOnly ||
                result.gaveUpIds.length ||
                result.errors.length
            ) {
                await this.telegram.sendMessage(this.renderResult(result));
            }
        } catch (error) {
            const reason =
                error instanceof Error ? error.message : String(error);
            await this.telegram.sendMessage(
                `ALFA DEAL INIT RECOVERY: прогон не выполнен — ${reason}`,
            );
        }
    }

    /** Тот же прогон вручную — проверить, не дожидаясь расписания */
    async run(): Promise<DealInitRecoveryResult> {
        const { bitrix } = await this.pbx.init(DEFAULT_DOMAIN);
        const service = new DealInitRecoveryService(bitrix, (dealId) =>
            this.enqueue(dealId),
        );
        return await service.run();
    }

    /**
     * Крон не принимает заявку сам, а кладет её в ту же очередь, что и вебхук.
     *
     * Иначе крон и вебхук идут двумя независимыми путями и регулярно
     * встречаются на одной сделке: 17.11.2026 по сделке 204296 крон принял
     * её в 16:27 (форма была в 16:21, порог подхвата 5 минут), а вебхук
     * портала доехал только в 16:28 — и участника завели дважды. Через
     * общую очередь jobId схлопывает повтор независимо от того, кто пришёл
     * первым.
     */
    private async enqueue(dealId: number): Promise<{
        status: 'queued' | 'revived' | 'already' | 'gave-up';
    }> {
        //Через общий сервис, а не queue.add напрямую: Bull при существующем
        //jobId молча «успешно» ничего не добавляет, а упавшие задачи у нас
        //хранятся. Прямой вызов навсегда закрывал сделку от подхвата
        const { status } = await this.dealInitEnqueue.enqueue({
            dealId,
            domain: DEFAULT_DOMAIN,
            source: DealInitSource.RECOVERY,
        });

        return { status };
    }

    private renderResult(result: DealInitRecoveryResult): string {
        const lines = [
            'ALFA DEAL INIT RECOVERY: прогон завершен',
            `- кандидатов найдено: ${result.candidates}`,
            //крон сам заявку не принимает, а ставит в общую с вебхуком
            //очередь — приём идёт в воркере
            `- поставлено в очередь приёма: ${result.processed}${
                result.processedIds.length
                    ? ` (${result.processedIds.join(', ')})`
                    : ''
            }`,
            `- уже были не пустые, только помечены: ${result.markedOnly}`,
        ];

        if (result.gaveUpIds.length) {
            lines.push(
                `- ПРИЁМ НЕ УДАЁТСЯ, нужен человек: ${result.gaveUpIds.join(', ')}`,
                '  крон пробовал несколько раз и сдался; причину ищите в сообщениях «не принята»',
            );
        }

        if (result.errors.length) {
            lines.push(`- ошибок: ${result.errors.length}`);
            lines.push(...result.errors.slice(0, 10).map((e) => `    ${e}`));
        }

        return lines.join('\n');
    }
}
