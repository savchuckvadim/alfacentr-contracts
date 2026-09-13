import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { RedisService } from '@/core/redis/redis.service';
import { IBotRequest, TBotChannel, TBotRequestStatus } from '../types/bot.types';

/** Заявки живут месяц: дольше они никому не нужны, а Redis не архив */
const REQUEST_TTL_SEC = 30 * 24 * 60 * 60;
/** Сколько последних заявок держим в индексе для списков и диагностики */
const RECENT_LIMIT = 500;

const requestKey = (id: string) => `bot:request:${id}`;
const RECENT_KEY = 'bot:requests:recent';
/** Обратный индекс: по сообщению находим заявку и не создаём вторую */
const messageKey = (channel: TBotChannel, dialogId: string, messageId: string) =>
    `bot:request:by-message:${channel}:${dialogId}:${messageId}`;

@Injectable()
export class BotRequestStore {
    private readonly logger = new Logger(BotRequestStore.name);

    constructor(private readonly redisService: RedisService) {}

    /**
     * Создаёт заявку, если по этому сообщению её ещё нет.
     *
     * Битрикс умеет повторить доставку события, а оператор — нажать кнопку
     * дважды. Без обратного индекса по сообщению это дало бы две задачи и два
     * подтверждения в чат на одно обращение.
     */
    async createIfAbsent(
        input: Omit<
            IBotRequest,
            'id' | 'status' | 'taskId' | 'assignedOperatorId' | 'createdAt' | 'updatedAt'
        >,
    ): Promise<{ request: IBotRequest; created: boolean }> {
        const redis = this.redisService.getClient();
        const indexKey = messageKey(input.channel, input.dialogId, input.messageId);

        const existingId = await redis.get(indexKey);
        if (existingId) {
            const existing = await this.get(existingId);
            if (existing) return { request: existing, created: false };
        }

        const now = new Date().toISOString();
        const request: IBotRequest = {
            ...input,
            id: randomUUID(),
            status: 'new',
            taskId: null,
            assignedOperatorId: null,
            createdAt: now,
            updatedAt: now,
        };

        await redis.set(requestKey(request.id), JSON.stringify(request), 'EX', REQUEST_TTL_SEC);
        await redis.set(indexKey, request.id, 'EX', REQUEST_TTL_SEC);
        await redis.lpush(RECENT_KEY, request.id);
        await redis.ltrim(RECENT_KEY, 0, RECENT_LIMIT - 1);

        return { request, created: true };
    }

    async get(id: string): Promise<IBotRequest | null> {
        const raw = await this.redisService.getClient().get(requestKey(id));
        if (!raw) return null;
        try {
            return JSON.parse(raw) as IBotRequest;
        } catch (error) {
            this.logger.warn(
                `Заявка ${id} лежит в Redis в непригодном виде: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
            return null;
        }
    }

    /** Частичное обновление: пишем только то, что меняется */
    async patch(
        id: string,
        patch: Partial<Pick<IBotRequest, 'status' | 'taskId' | 'assignedOperatorId'>>,
    ): Promise<IBotRequest | null> {
        const current = await this.get(id);
        if (!current) return null;

        const next: IBotRequest = {
            ...current,
            ...patch,
            updatedAt: new Date().toISOString(),
        };
        await this.redisService
            .getClient()
            .set(requestKey(id), JSON.stringify(next), 'EX', REQUEST_TTL_SEC);
        return next;
    }

    /**
     * Перевод статуса вперёд по цепочке. Возвращает false, если заявка уже
     * ушла дальше: так двойное нажатие кнопки не отправит ответ дважды.
     */
    async advance(id: string, to: TBotRequestStatus): Promise<IBotRequest | false> {
        const order: TBotRequestStatus[] = [
            'new',
            'acknowledged',
            'assigned',
            'answered',
            'ignored',
        ];
        const current = await this.get(id);
        if (!current) return false;

        const isFinal = current.status === 'answered' || current.status === 'ignored';
        if (isFinal) return false;
        if (order.indexOf(to) < order.indexOf(current.status) && to !== 'ignored') {
            return false;
        }

        const next = await this.patch(id, { status: to });
        return next ?? false;
    }

    async recent(limit = 50): Promise<IBotRequest[]> {
        const ids = await this.redisService.getClient().lrange(RECENT_KEY, 0, limit - 1);
        const found = await Promise.all(ids.map(id => this.get(id)));
        return found.filter((r): r is IBotRequest => r !== null);
    }
}
