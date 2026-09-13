import { Injectable, Logger } from '@nestjs/common';
import { PBXService } from '@/modules/pbx/pbx.servise';
import { BitrixBotConfigService } from './bitrix-bot-config.service';

type BitrixApiClient = {
    api: { call: (method: string, params: unknown) => Promise<unknown> };
};

export interface IBotRegistrationResult {
    action: 'registered' | 'updated' | 'skipped';
    botId: number | null;
    message: string;
}

/**
 * Регистрация бота на портале.
 *
 * Вызывается командой, а не при старте приложения: регистрация — разовое
 * административное действие. Делать её в жизненном цикле означало бы дёргать
 * портал на каждом перезапуске контейнера.
 *
 * imbot.register по существующему CODE вернёт ошибку, поэтому сначала
 * спрашиваем imbot.bot.list и при наличии бота вызываем imbot.update.
 */
@Injectable()
export class BitrixBotRegistrarService {
    private readonly logger = new Logger(BitrixBotRegistrarService.name);

    constructor(
        private readonly pbxService: PBXService,
        private readonly config: BitrixBotConfigService,
    ) {}

    async ensureRegistered(): Promise<IBotRegistrationResult> {
        const handler = this.config.eventHandlerUrl;
        const clientId = this.config.clientId;

        if (!handler) {
            return {
                action: 'skipped',
                botId: null,
                message:
                    'Не задан PUBLIC_API_URL — Битриксу некуда присылать события бота',
            };
        }
        if (!clientId) {
            return {
                action: 'skipped',
                botId: null,
                message:
                    'Не задан BOT_CLIENT_ID — для регистрации вебхуком он обязателен',
            };
        }

        const existingId = await this.findByCode();

        const properties = {
            NAME: 'Альфа',
            LAST_NAME: 'Помощник',
            WORK_POSITION: 'Заявки по семинарам',
            COLOR: 'GREEN',
        };

        if (existingId) {
            await this.call('imbot.update', {
                BOT_ID: existingId,
                CLIENT_ID: clientId,
                FIELDS: {
                    EVENT_HANDLER: handler,
                    EVENT_MESSAGE_ADD: handler,
                    EVENT_WELCOME_MESSAGE: handler,
                    EVENT_BOT_DELETE: handler,
                    PROPERTIES: properties,
                },
            });
            this.logger.log(`Бот ${existingId} обновлён, обработчик ${handler}`);
            return {
                action: 'updated',
                botId: existingId,
                message: `Бот уже был зарегистрирован, обновлены обработчики. BOT_ID=${existingId}`,
            };
        }

        const response = await this.call<{ result?: number | string }>('imbot.register', {
            CODE: this.config.code,
            TYPE: 'B',
            OPENLINE: 'N',
            CLIENT_ID: clientId,
            EVENT_HANDLER: handler,
            EVENT_MESSAGE_ADD: handler,
            EVENT_WELCOME_MESSAGE: handler,
            EVENT_BOT_DELETE: handler,
            PROPERTIES: properties,
        });

        const botId = Number(response?.result) || null;
        this.logger.log(`Бот зарегистрирован, BOT_ID=${botId}`);
        return {
            action: 'registered',
            botId,
            message: `Бот зарегистрирован. Запишите BOT_ID=${botId} в окружение и перезапустите бэкенд.`,
        };
    }

    /** Ищем бота по нашему CODE среди уже зарегистрированных на портале */
    private async findByCode(): Promise<number | null> {
        const response = await this.call<{ result?: unknown }>('imbot.bot.list', {});
        const raw = response?.result;
        const list = Array.isArray(raw)
            ? raw
            : raw && typeof raw === 'object'
              ? Object.values(raw as Record<string, unknown>)
              : [];

        for (const item of list) {
            if (!item || typeof item !== 'object') continue;
            const bot = item as Record<string, unknown>;
            const rawCode = bot.CODE ?? bot.code;
            // Значение приходит из чужого ответа: строкой оно быть обязано,
            // но полагаться на это нельзя
            const code = typeof rawCode === 'string' ? rawCode : '';
            if (code !== this.config.code) continue;
            const id = Number(bot.ID ?? bot.id);
            if (Number.isFinite(id) && id > 0) return id;
        }
        return null;
    }

    private async call<T>(method: string, params: unknown): Promise<T | null> {
        try {
            const { bitrix } = await this.pbxService.init(this.config.domain);
            return (await (bitrix as unknown as BitrixApiClient).api.call(
                method,
                params,
            )) as T;
        } catch (error) {
            this.logger.error(
                `${method}: ${error instanceof Error ? error.message : String(error)}`,
            );
            throw error instanceof Error ? error : new Error(String(error));
        }
    }
}
