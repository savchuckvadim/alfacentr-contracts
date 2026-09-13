import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';
import { IBotOperator } from '../types/bot.types';

const operatorKey = (bitrixUserId: number) => `bot:operator:${bitrixUserId}`;
/** Обратный индекс: кнопку нажали в чате Телеграма, надо понять кто это */
const byTelegramKey = (telegramChatId: number) => `bot:operator:tg:${telegramChatId}`;
const OPERATORS_SET = 'bot:operators';

@Injectable()
export class BotOperatorStore {
    private readonly logger = new Logger(BotOperatorStore.name);

    constructor(private readonly redisService: RedisService) {}

    /**
     * Добавляет или обновляет оператора.
     *
     * Операторы не в конфиге, а в Redis намеренно: сотрудников добавляют и
     * убирают на ходу, и для этого не должен требоваться деплой.
     */
    async upsert(operator: Omit<IBotOperator, 'addedAt'> & { addedAt?: string }): Promise<IBotOperator> {
        const redis = this.redisService.getClient();
        const existing = await this.getByBitrixUser(operator.bitrixUserId);

        const next: IBotOperator = {
            ...operator,
            addedAt: existing?.addedAt ?? operator.addedAt ?? new Date().toISOString(),
        };

        // Чат Телеграма мог поменяться: старый обратный индекс убираем,
        // иначе на одну кнопку нашлись бы два оператора
        if (existing && existing.telegramChatId !== next.telegramChatId) {
            await redis.del(byTelegramKey(existing.telegramChatId));
        }

        await redis.set(operatorKey(next.bitrixUserId), JSON.stringify(next));
        await redis.set(byTelegramKey(next.telegramChatId), String(next.bitrixUserId));
        await redis.sadd(OPERATORS_SET, String(next.bitrixUserId));
        return next;
    }

    async getByBitrixUser(bitrixUserId: number): Promise<IBotOperator | null> {
        return this.read(await this.redisService.getClient().get(operatorKey(bitrixUserId)));
    }

    async getByTelegramChat(telegramChatId: number): Promise<IBotOperator | null> {
        const id = await this.redisService.getClient().get(byTelegramKey(telegramChatId));
        if (!id) return null;
        return this.getByBitrixUser(Number(id));
    }

    async list(onlyActive = true): Promise<IBotOperator[]> {
        const ids = await this.redisService.getClient().smembers(OPERATORS_SET);
        const found = await Promise.all(ids.map(id => this.getByBitrixUser(Number(id))));
        const operators = found.filter((o): o is IBotOperator => o !== null);
        return onlyActive ? operators.filter(o => o.isActive) : operators;
    }

    /**
     * Не удаляем, а выключаем: история делегирований ссылается на оператора,
     * и после удаления в задачах остались бы ссылки в пустоту.
     */
    async deactivate(bitrixUserId: number): Promise<boolean> {
        const operator = await this.getByBitrixUser(bitrixUserId);
        if (!operator) return false;
        await this.upsert({ ...operator, isActive: false });
        return true;
    }

    private read(raw: string | null): IBotOperator | null {
        if (!raw) return null;
        try {
            return JSON.parse(raw) as IBotOperator;
        } catch (error) {
            this.logger.warn(
                `Оператор лежит в Redis в непригодном виде: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
            return null;
        }
    }
}
