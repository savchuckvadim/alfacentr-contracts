import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Настройки бота.
 *
 * CLIENT_ID и BOT_ID — секреты и идентификаторы конкретного портала, поэтому
 * живут в окружении, а не в коде. Без них бот не работает, но приложение
 * должно подниматься: бот — не критичный путь, ронять из-за него запуск нельзя.
 */
@Injectable()
export class BitrixBotConfigService {
    private readonly logger = new Logger(BitrixBotConfigService.name);

    constructor(private readonly configService: ConfigService) {}

    get domain(): string {
        return (
            this.configService.get<string>('BITRIX_DOMAIN') ||
            'alfacentr.bitrix24.ru'
        );
    }

    /** Код бота, уникальный в рамках портала */
    get code(): string {
        return this.configService.get<string>('BOT_CODE') || 'alfa_seminars_bot';
    }

    /**
     * Ключ, который выдаётся боту при регистрации вебхуком и передаётся в
     * каждый вызов от его имени. Придумываем один раз и не меняем.
     */
    get clientId(): string | null {
        return this.configService.get<string>('BOT_CLIENT_ID') || null;
    }

    /** Появляется после регистрации, его возвращает imbot.register */
    get botId(): number | null {
        const raw = this.configService.get<string>('BOT_ID');
        const id = Number(raw);
        return Number.isFinite(id) && id > 0 ? id : null;
    }

    /** Группа, в которой бот создаёт задачи из обращений */
    get taskGroupId(): number {
        const raw = this.configService.get<string>('BOT_TASK_GROUP_ID');
        const id = Number(raw);
        return Number.isFinite(id) && id > 0 ? id : 26;
    }

    /** Публичный адрес бэкенда: на него Битрикс присылает события */
    get publicApiUrl(): string | null {
        const url = this.configService.get<string>('PUBLIC_API_URL');
        return url ? url.replace(/\/+$/, '') : null;
    }

    get eventHandlerUrl(): string | null {
        const base = this.publicApiUrl;
        return base ? `${base}/api/bot/bitrix/event` : null;
    }

    /** Готов ли бот к работе: без этого отвечать в чат нечем */
    get isReady(): boolean {
        const ready = Boolean(this.clientId && this.botId);
        if (!ready) {
            this.logger.warn(
                'Бот не настроен: нужны BOT_CLIENT_ID и BOT_ID. События будут приниматься, но ответы в чат не пойдут.',
            );
        }
        return ready;
    }
}
