import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';

/**
 * Замок на приём одной сделки.
 *
 * Общая очередь с одним jobId уже отсекает повторы, но щель остаётся:
 * задача отработала, по removeOnComplete удалилась из Redis, и следующий
 * add с тем же jobId создаёт её заново. При приёме, который идёт секунды,
 * и кроне раз в три минуты это редко, но «редко» на потоке заявок
 * означает «раз в несколько дней», а цена — задвоенный участник в
 * договоре.
 *
 * Замок живёт дольше приёма и переживает удаление задачи, поэтому
 * закрывает именно эту щель. Он не заменяет отпечаток участника:
 * отпечаток защищает от повтора через час и от ручного пинка, замок —
 * от двух приёмов внахлёст.
 */

/**
 * Держим заметно дольше самого приёма: наблюдаемый приём идёт секунды
 * (сделка 203958 — 22 с), но отдельные вызовы портала упираются в таймаут
 * 25 с, а товаров и участников в заявке бывает десяток. Пяти минут хватает
 * с запасом, и столько же живёт выполненная задача в очереди
 */
export const DEAL_INIT_LOCK_TTL_SECONDS = 300;

export const getDealInitLockKey = (dealId: number | string): string =>
    `deal-init:lock:${Number(dealId)}`;

@Injectable()
export class DealInitLockService {
    private readonly logger = new Logger(DealInitLockService.name);

    constructor(private readonly redis: RedisService) {}

    /**
     * Пытается взять замок. false — приём по этой сделке уже идёт.
     *
     * SET NX с TTL атомарен: двое не возьмут замок, даже если придут
     * одновременно. Если Redis недоступен — пропускаем приём вперёд:
     * потерять заявку хуже, чем принять её дважды, а от повтора защищает
     * отпечаток участника и замена состава товаров
     */
    async acquire(dealId: number): Promise<boolean> {
        try {
            const result = await this.redis
                .getClient()
                .set(
                    getDealInitLockKey(dealId),
                    String(Date.now()),
                    'EX',
                    DEAL_INIT_LOCK_TTL_SECONDS,
                    'NX',
                );

            return result === 'OK';
        } catch (error) {
            this.logger.error(
                `Замок не взят из-за ошибки Redis, сделка ${dealId} — принимаем без замка`,
                error instanceof Error ? error.message : String(error),
            );
            return true;
        }
    }

    /**
     * Снимает замок после приёма.
     *
     * Снимаем и при ошибке приёма: иначе крон подхвата пять минут не сможет
     * забрать сделку, которая осталась пустой
     */
    async release(dealId: number): Promise<void> {
        try {
            await this.redis.getClient().del(getDealInitLockKey(dealId));
        } catch (error) {
            //замок истечёт сам по TTL, терять приём из-за этого незачем
            this.logger.warn(
                `Замок не снят, сделка ${dealId}: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        }
    }
}
