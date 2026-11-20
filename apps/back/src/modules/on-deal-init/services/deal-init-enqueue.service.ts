import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { QueueNames } from '@/modules/queue/constants/queue-names.enum';
import { JobNames } from '@/modules/queue/constants/job-names.enum';

import {
    DEAL_INIT_JOB_ATTEMPTS,
    DEAL_INIT_JOB_KEEP_MS,
    DealInitJobData,
    decideDealInitEnqueue,
    getDealInitJobId,
} from './deal-init-job.rules';

export type DealInitEnqueueStatus =
    /** поставлена новая задача */
    | 'queued'
    /** прежняя упала или давно закончилась — убрана, поставлена заново */
    | 'revived'
    /** уже в работе, только что отработала или не пора повторять */
    | 'already'
    /** крон перепробовал достаточно — об этом сообщается один раз */
    | 'gave-up';

export interface DealInitEnqueueResult {
    status: DealInitEnqueueStatus;
    /** Сколько раз сделку уже оживляли */
    retries: number;
}

/**
 * Единственное место, где заявка ставится в очередь приёма — и для
 * вебхука, и для крона подхвата.
 *
 * Раньше оба вызывали queue.add напрямую, а Bull при существующем jobId
 * молча возвращает «успех» с id старой задачи — в каком бы состоянии та
 * ни была. Упавшие задачи у нас хранятся (removeOnFail: false), поэтому
 * первая же пятисотка портала закрывала сделку от повторного приёма
 * навсегда. 20.11.2026 так застряли четыре заявки: крон каждые три
 * минуты отчитывался «поставлено в очередь», а сделки стояли пустыми.
 */
@Injectable()
export class DealInitEnqueueService {
    private readonly logger = new Logger(DealInitEnqueueService.name);

    constructor(
        @InjectQueue(QueueNames.DEAL_INIT)
        private readonly queue: Queue,
    ) {}

    async enqueue(data: DealInitJobData): Promise<DealInitEnqueueResult> {
        const jobId = getDealInitJobId(data.dealId);
        const existing = await this.queue.getJob(jobId);

        const existingData = (existing?.data ?? {}) as Partial<DealInitJobData>;
        const retries = Number(existingData.retries ?? 0);

        const action = decideDealInitEnqueue(
            existing
                ? {
                      state: await existing.getState(),
                      finishedOn: existing.finishedOn,
                      retries,
                  }
                : null,
            Date.now(),
            data.source,
        );

        switch (action) {
            case 'skip':
                return { status: 'already', retries };

            case 'give-up':
                return await this.giveUp(existing, existingData, retries);

            case 'revive': {
                const removed = await this.removeOld(existing, data.dealId);
                //не получилось убрать — задачу кто-то взял в работу между
                //проверкой и удалением, значит она и так идёт
                if (!removed) return { status: 'already', retries };

                await this.add({ ...data, retries: retries + 1 });
                return { status: 'revived', retries: retries + 1 };
            }

            default:
                await this.add(data);
                return { status: 'queued', retries: 0 };
        }
    }

    private async add(data: DealInitJobData) {
        await this.queue.add(JobNames.DEAL_INIT, data, {
            jobId: getDealInitJobId(data.dealId),
            attempts: DEAL_INIT_JOB_ATTEMPTS,
            removeOnComplete: {
                age: Math.round(DEAL_INIT_JOB_KEEP_MS / 1000),
            },
            removeOnFail: false,
        });
    }

    private async removeOld(
        existing: Awaited<ReturnType<Queue['getJob']>>,
        dealId: number,
    ): Promise<boolean> {
        try {
            await existing?.remove();
            return true;
        } catch (error) {
            this.logger.warn(
                `Сделка ${dealId}: прежнюю задачу убрать не вышло — ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
            return false;
        }
    }

    /**
     * Сообщаем о сдаче один раз: сделка остаётся кандидатом крона, и без
     * пометки он каждые три минуты повторял бы то же сообщение
     */
    private async giveUp(
        existing: Awaited<ReturnType<Queue['getJob']>>,
        existingData: Partial<DealInitJobData>,
        retries: number,
    ): Promise<DealInitEnqueueResult> {
        if (existingData.gaveUp) return { status: 'already', retries };

        try {
            await existing?.update({ ...existingData, gaveUp: true });
        } catch (error) {
            //не отметили — сообщим ещё раз в следующий прогон, это лучше,
            //чем промолчать о сделке, которую никто не принимает
            this.logger.warn(
                `Не удалось отметить сдачу: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        }

        return { status: 'gave-up', retries };
    }
}
