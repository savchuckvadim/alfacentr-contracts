import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PBXService } from '@/modules/pbx';
import { TelegramService } from '@/modules/telegram/telegram.service';
import { RedisService } from '@/core/redis/redis.service';
import { PROJECT_TIME_ZONE } from '@/lib/utils/project-time.util';
import {
    DEFAULT_LOOKBACK_HOURS,
    NumberCollision,
    NumberDuplicatesResult,
    NumberDuplicatesService,
    holderRef,
} from '../services/number-duplicates.service';

const DEFAULT_DOMAIN = 'alfacentr.bitrix24.ru';
const SEMINAR_ENTITY_TYPE_ID = 159;

/** Множество уже названных в чате повторов: чтобы один и тот же не звучал снова и снова */
export const REPORTED_SET_KEY = 'number-duplicates:reported';
const REPORTED_TTL_SECONDS = 90 * 24 * 3600;
/** В одно сообщение Telegram влезает 4096 символов, длинный список режем */
const MAX_COLLISIONS_IN_MESSAGE = 12;

/**
 * Страховка нумерации договоров: три раза в день ищет номера, которые стоят
 * у двух записей сразу.
 *
 * Дубль возникает, когда бизнес-процесс Битрикса и приложение ведут счётчик
 * независимо. Починка срабатывает сразу, но только по вебхуку из БП. Если
 * вебхук не дошёл, о дубле никто не узнает, пока два клиента не получат один
 * и тот же договор. Этот прогон ловит такие случаи, в том числе заведённые
 * вручную.
 *
 * Молчит, пока новых повторов нет: иначе канал зарастёт отчётами. Уже
 * названный повтор повторно не звучит.
 */
@Injectable()
export class NumberDuplicatesUseCase {
    private readonly logger = new Logger(NumberDuplicatesUseCase.name);

    constructor(
        private readonly pbx: PBXService,
        private readonly telegram: TelegramService,
        private readonly redis: RedisService,
    ) {}

    //09:00, 13:00 и 17:00 по Новосибирску. Пояс задаём явно: контейнер идёт
    //по UTC, и без него эти часы пришлись бы на 16:00, 20:00 и 00:00
    @Cron('0 0 9,13,17 * * *', {
        name: 'number-duplicates',
        timeZone: PROJECT_TIME_ZONE,
    })
    async handleCron(): Promise<void> {
        try {
            const result = await this.run();
            await this.report(result);
        } catch (error) {
            const reason =
                error instanceof Error ? error.message : String(error);
            await this.telegram.sendMessage(
                `ALFA ДУБЛИ НОМЕРОВ: прогон не выполнен — ${reason}`,
            );
        }
    }

    /**
     * Поиск без отправки в чат — для ручной проверки. Окно в часах можно
     * расширить, чтобы посмотреть историю глубже обычных трёх суток
     */
    async run(
        lookbackHours: number = DEFAULT_LOOKBACK_HOURS,
    ): Promise<NumberDuplicatesResult> {
        const { bitrix } = await this.pbx.init(DEFAULT_DOMAIN);
        return await new NumberDuplicatesService(bitrix, lookbackHours).run();
    }

    /** Отправляет в чат только повторы, о которых там ещё не говорили */
    async report(result: NumberDuplicatesResult): Promise<NumberCollision[]> {
        const fresh = await this.takeUnreported(result.collisions);

        if (fresh.length || result.errors.length) {
            await this.telegram.sendMessage(this.render(result, fresh));
        }
        return fresh;
    }

    /**
     * Запоминает повторы в Redis и возвращает те, что видим впервые.
     * Подпись включает состав записей: если к повтору добавилась третья,
     * это новость.
     *
     * Недоступный Redis не повод молчать: лучше повторить уже названное, чем
     * пропустить новое.
     */
    private async takeUnreported(
        collisions: NumberCollision[],
    ): Promise<NumberCollision[]> {
        if (!collisions.length) return [];

        try {
            const client = this.redis.getClient();
            const fresh: NumberCollision[] = [];

            for (const collision of collisions) {
                const signature = this.signature(collision);
                const added = await client.sadd(REPORTED_SET_KEY, signature);
                if (added === 1) fresh.push(collision);
            }

            await client.expire(REPORTED_SET_KEY, REPORTED_TTL_SECONDS);
            return fresh;
        } catch (error) {
            this.logger.warn(
                `Redis недоступен, отчёт без дедупликации: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
            return collisions;
        }
    }

    private signature(collision: NumberCollision): string {
        return `${collision.key}|${collision.holders.map(holderRef).join(',')}`;
    }

    private link(kind: 'smart' | 'deal', id: number): string {
        return kind === 'smart'
            ? `https://${DEFAULT_DOMAIN}/crm/type/${SEMINAR_ENTITY_TYPE_ID}/details/${id}/`
            : `https://${DEFAULT_DOMAIN}/crm/deal/details/${id}/`;
    }

    render(result: NumberDuplicatesResult, fresh: NumberCollision[]): string {
        const lines: string[] = [];

        if (fresh.length) {
            lines.push(
                `ALFA ДУБЛИ НОМЕРОВ ДОГОВОРОВ: новых повторов — ${fresh.length}`,
            );
            for (const collision of fresh.slice(0, MAX_COLLISIONS_IN_MESSAGE)) {
                lines.push('', `• ${collision.key}`);
                for (const holder of collision.holders) {
                    const label = holder.kind === 'smart' ? 'смарт' : 'сделка';
                    lines.push(
                        `    ${label} ${holder.id}: ${this.link(holder.kind, holder.id)}`,
                    );
                }
            }
            if (fresh.length > MAX_COLLISIONS_IN_MESSAGE) {
                lines.push(
                    '',
                    `…и ещё ${fresh.length - MAX_COLLISIONS_IN_MESSAGE}. Полный список: POST /api/number-duplicates/run`,
                );
            }
        } else {
            lines.push('ALFA ДУБЛИ НОМЕРОВ ДОГОВОРОВ: прогон с ошибками');
        }

        lines.push(
            '',
            `Проверено недавно изменённых записей: ${result.recentChecked}, префиксов: ${result.prefixesChecked}`,
        );

        if (result.errors.length) {
            lines.push(`Ошибок: ${result.errors.length}`);
            lines.push(...result.errors.slice(0, 5).map((e) => `    ${e}`));
        }

        return lines.join('\n');
    }
}
