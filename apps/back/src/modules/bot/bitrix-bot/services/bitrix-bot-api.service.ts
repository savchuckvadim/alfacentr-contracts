import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PBXService } from '@/modules/pbx/pbx.servise';
import {
    BotChannelRegistry,
    IBotChannel,
    TBotChannel,
} from '../../bot-core';
import { BitrixBotConfigService } from './bitrix-bot-config.service';

type BitrixApiClient = {
    api: { call: (method: string, params: unknown) => Promise<unknown> };
};

/** Кнопка под сообщением бота */
export interface IBotKeyboardButton {
    TEXT: string;
    COMMAND?: string;
    COMMAND_PARAMS?: string;
    LINK?: string;
    BG_COLOR?: string;
    TEXT_COLOR?: string;
    DISPLAY?: 'LINE' | 'BLOCK';
}

const CALL_ATTEMPTS = 3;
const CALL_RETRY_DELAY_MS = 500;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Канал Битрикса: отправка сообщений от имени бота.
 *
 * Работает на классическом imbot.*: imbot.v2 на портале не раскатан —
 * проверено и через список методов, и через REST 3.0, там «метод не найден».
 * Классические методы помечены deprecated, но присутствуют и работают.
 */
@Injectable()
export class BitrixBotApiService implements IBotChannel, OnModuleInit {
    readonly channel: TBotChannel = 'bitrix';
    private readonly logger = new Logger(BitrixBotApiService.name);

    constructor(
        private readonly pbxService: PBXService,
        private readonly config: BitrixBotConfigService,
        private readonly registry: BotChannelRegistry,
    ) {}

    onModuleInit(): void {
        this.registry.register(this);
    }

    async sendReply(dialogId: string, text: string): Promise<void> {
        await this.sendMessage(dialogId, text);
    }

    async sendMessage(
        dialogId: string,
        message: string,
        keyboard?: IBotKeyboardButton[],
    ): Promise<number | null> {
        if (!this.config.isReady) return null;

        const params: Record<string, unknown> = {
            BOT_ID: this.config.botId,
            CLIENT_ID: this.config.clientId,
            DIALOG_ID: dialogId,
            MESSAGE: message,
        };
        if (keyboard?.length) params.KEYBOARD = { BUTTONS: keyboard };

        const response = await this.call<{ result?: number }>(
            'imbot.message.add',
            params,
            `отправка сообщения бота в ${dialogId}`,
        );
        return Number(response?.result) || null;
    }

    /** Комментарий в задачу: решения должны оставаться в задаче, а не в чате */
    async addTaskComment(taskId: number, text: string): Promise<void> {
        await this.call<unknown>(
            'task.commentitem.add',
            [taskId, { POST_MESSAGE: text }],
            `комментарий в задачу ${taskId}`,
        );
    }

    async createTask(fields: Record<string, unknown>): Promise<number | null> {
        const response = await this.call<{ result?: { task?: { id?: number | string } } }>(
            'tasks.task.add',
            { fields },
            'создание задачи из обращения',
        );
        const id = Number(response?.result?.task?.id);
        return Number.isFinite(id) && id > 0 ? id : null;
    }

    async updateTask(taskId: number, fields: Record<string, unknown>): Promise<void> {
        await this.call<unknown>(
            'tasks.task.update',
            { taskId, fields },
            `обновление задачи ${taskId}`,
        );
    }

    private async client(): Promise<BitrixApiClient> {
        const { bitrix } = await this.pbxService.init(this.config.domain);
        return bitrix as unknown as BitrixApiClient;
    }

    /** Повторы: событие терять нельзя, а Битрикс отвечает не всегда с первого раза */
    private async call<T>(
        method: string,
        params: unknown,
        what: string,
    ): Promise<T | null> {
        let lastError: unknown;
        for (let attempt = 1; attempt <= CALL_ATTEMPTS; attempt++) {
            try {
                const bitrix = await this.client();
                return (await bitrix.api.call(method, params)) as T;
            } catch (error) {
                lastError = error;
                this.logger.warn(
                    `${what}: попытка ${attempt} из ${CALL_ATTEMPTS} не удалась — ${
                        error instanceof Error ? error.message : String(error)
                    }`,
                );
                if (attempt < CALL_ATTEMPTS) await sleep(CALL_RETRY_DELAY_MS * attempt);
            }
        }
        this.logger.error(
            `${what}: все попытки неудачны — ${
                lastError instanceof Error ? lastError.message : String(lastError)
            }`,
        );
        return null;
    }
}
