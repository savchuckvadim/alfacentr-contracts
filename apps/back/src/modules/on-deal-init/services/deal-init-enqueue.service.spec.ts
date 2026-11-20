import {
    DEAL_INIT_MAX_RECOVERIES,
    DealInitSource,
    getDealInitJobId,
} from './deal-init-job.rules';
import { DealInitEnqueueService } from './deal-init-enqueue.service';

/**
 * 20.11.2026: упавшие задачи приёма лежали в Redis, Bull молча отказывался
 * добавлять новую с тем же jobId, и крон каждые три минуты рапортовал об
 * успехе по сделкам, которые так и стояли пустыми.
 */

interface FakeJob {
    data: Record<string, unknown>;
    finishedOn?: number;
    getState: jest.Mock<Promise<string>, []>;
    remove: jest.Mock<Promise<void>, []>;
    update: jest.Mock<Promise<void>, [Record<string, unknown>]>;
}

const makeJob = (
    state: string,
    over: Partial<Pick<FakeJob, 'data' | 'finishedOn'>> = {},
): FakeJob => ({
    data: over.data ?? {},
    finishedOn: over.finishedOn,
    getState: jest.fn<Promise<string>, []>().mockResolvedValue(state),
    remove: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
    update: jest
        .fn<Promise<void>, [Record<string, unknown>]>()
        .mockResolvedValue(undefined),
});

const makeService = (existing: FakeJob | null) => {
    const queue = {
        getJob: jest.fn().mockResolvedValue(existing),
        add: jest
            .fn<
                Promise<unknown>,
                [string, Record<string, unknown>, Record<string, unknown>]
            >()
            .mockResolvedValue({ id: 'whatever' }),
    };

    return {
        queue,
        service: new DealInitEnqueueService(queue as never),
    };
};

const HOUR_AGO = () => Date.now() - 60 * 60 * 1000;
const base = { dealId: 204972, domain: 'alfacentr.bitrix24.ru' };

describe('DealInitEnqueueService', () => {
    it('задачи нет — ставим с jobId сделки', async () => {
        const { service, queue } = makeService(null);

        const result = await service.enqueue({
            ...base,
            source: DealInitSource.RECOVERY,
        });

        expect(result.status).toBe('queued');
        expect(queue.add).toHaveBeenCalledTimes(1);
        expect(queue.add.mock.calls[0][2]).toMatchObject({
            jobId: getDealInitJobId(204972),
        });
    });

    it('упавшая давно задача убирается и ставится заново — случай 20.11.2026', async () => {
        const failed = makeJob('failed', { finishedOn: HOUR_AGO() });
        const { service, queue } = makeService(failed);

        const result = await service.enqueue({
            ...base,
            source: DealInitSource.RECOVERY,
        });

        expect(result.status).toBe('revived');
        expect(failed.remove).toHaveBeenCalledTimes(1);
        expect(queue.add).toHaveBeenCalledTimes(1);
        //счётчик растёт: по нему крон поймёт, что пора сдаться
        expect(queue.add.mock.calls[0][1]).toMatchObject({ retries: 1 });
    });

    it('задача в работе не трогается', async () => {
        const active = makeJob('active');
        const { service, queue } = makeService(active);

        const result = await service.enqueue({
            ...base,
            source: DealInitSource.RECOVERY,
        });

        expect(result.status).toBe('already');
        expect(active.remove).not.toHaveBeenCalled();
        expect(queue.add).not.toHaveBeenCalled();
    });

    it('крон сдаётся после предела и говорит об этом один раз', async () => {
        const exhausted = makeJob('failed', {
            finishedOn: HOUR_AGO(),
            data: { retries: DEAL_INIT_MAX_RECOVERIES },
        });
        const { service, queue } = makeService(exhausted);

        const first = await service.enqueue({
            ...base,
            source: DealInitSource.RECOVERY,
        });

        expect(first.status).toBe('gave-up');
        expect(queue.add).not.toHaveBeenCalled();
        expect(exhausted.update).toHaveBeenCalledWith(
            expect.objectContaining({ gaveUp: true }),
        );

        //следующий прогон видит отметку и молчит: иначе тот же отчёт
        //приходил бы каждые три минуты
        const again = makeService(
            makeJob('failed', {
                finishedOn: HOUR_AGO(),
                data: { retries: DEAL_INIT_MAX_RECOVERIES, gaveUp: true },
            }),
        );
        const second = await again.service.enqueue({
            ...base,
            source: DealInitSource.RECOVERY,
        });

        expect(second.status).toBe('already');
    });

    it('не вышло убрать прежнюю задачу — значит её уже взяли, не дублируем', async () => {
        const failed = makeJob('failed', { finishedOn: HOUR_AGO() });
        failed.remove.mockRejectedValue(
            new Error('Could not remove locked job'),
        );
        const { service, queue } = makeService(failed);

        const result = await service.enqueue({
            ...base,
            source: DealInitSource.HOOK,
        });

        expect(result.status).toBe('already');
        expect(queue.add).not.toHaveBeenCalled();
    });

    it('не отметили сдачу — всё равно сообщаем, лучше повтор, чем тишина', async () => {
        const exhausted = makeJob('failed', {
            finishedOn: HOUR_AGO(),
            data: { retries: DEAL_INIT_MAX_RECOVERIES },
        });
        exhausted.update.mockRejectedValue(new Error('redis недоступен'));
        const { service } = makeService(exhausted);

        const result = await service.enqueue({
            ...base,
            source: DealInitSource.RECOVERY,
        });

        expect(result.status).toBe('gave-up');
    });
});
