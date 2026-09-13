import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/core/redis/redis.service';
import {
    BotChannelRegistry,
    BotOperatorStore,
    BotRequestTextService,
    IBotChannel,
    IBotRequest,
    TBotChannel,
} from '../../bot-core';
import { TelegramApiService } from './telegram-api.service';
import { TG_ACTION } from '../types/telegram-update.type';

/** Оператор набирает ответ не мгновенно, но и не сутками */
const AWAITING_TTL_SEC = 20 * 60;
const awaitingKey = (chatId: number) => `bot:tg:awaiting:${chatId}`;
/** Где лежит карточка заявки у оператора — чтобы потом снять с неё кнопки */
const cardKey = (requestId: string, chatId: number) =>
    `bot:tg:card:${requestId}:${chatId}`;

const escapeHtml = (text: string) =>
    text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

/**
 * Телеграм как канал управления: показывает операторам карточки заявок и
 * принимает их решения.
 *
 * Обращения сюда не приходят — они приходят из Битрикса. Телеграм здесь
 * пульт, а не вход.
 */
@Injectable()
export class TelegramChannelService implements IBotChannel, OnModuleInit {
    readonly channel: TBotChannel = 'telegram';
    private readonly logger = new Logger(TelegramChannelService.name);

    constructor(
        private readonly api: TelegramApiService,
        private readonly operators: BotOperatorStore,
        private readonly text: BotRequestTextService,
        private readonly registry: BotChannelRegistry,
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
    ) {}

    onModuleInit(): void {
        this.registry.register(this);
    }

    /**
     * Прямой ответ в телеграм-чат тут почти не нужен: канал управляющий.
     * Метод есть, потому что его требует контракт канала.
     */
    async sendReply(dialogId: string, text: string): Promise<void> {
        const chatId = Number(dialogId);
        if (!Number.isFinite(chatId)) return;
        await this.api.sendMessage(chatId, escapeHtml(text));
    }

    /**
     * Карточка заявки уходит всем активным операторам, а если их ещё нет —
     * администратору. Иначе первое же обращение утонуло бы молча.
     */
    async showRequestCard(request: IBotRequest): Promise<void> {
        if (!this.api.isReady) return;

        const operators = await this.operators.list();
        const targets = operators.length
            ? operators.map(o => o.telegramChatId)
            : [this.api.adminChatId].filter((id): id is number => id !== null);

        if (!targets.length) {
            this.logger.warn(
                `Заявка ${request.id}: нет ни операторов, ни TELEGRAM_ADMIN_CHAT_ID — карточку некому показать`,
            );
            return;
        }

        const card = this.renderCard(request);
        const keyboard = [
            [
                { text: 'Ответить', callback_data: `${TG_ACTION.reply}:${request.id}` },
                { text: 'Делегировать', callback_data: `${TG_ACTION.delegate}:${request.id}` },
            ],
            [
                { text: 'Готово', callback_data: `${TG_ACTION.done}:${request.id}` },
                { text: 'Игнор', callback_data: `${TG_ACTION.ignore}:${request.id}` },
            ],
        ];

        for (const chatId of targets) {
            const messageId = await this.api.sendMessage(chatId, card, keyboard);
            if (messageId) {
                await this.redisService
                    .getClient()
                    .set(cardKey(request.id, chatId), String(messageId), 'EX', 7 * 24 * 3600);
            }
        }
    }

    renderCard(request: IBotRequest): string {
        const domain =
            this.configService.get<string>('BITRIX_DOMAIN') || 'alfacentr.bitrix24.ru';
        const chatLink = /^chat(\d+)$/.test(request.dialogId)
            ? `https://${domain}/online/?IM_DIALOG=${request.dialogId}`
            : null;
        const taskLink = request.taskId
            ? `https://${domain}/company/personal/user/502/tasks/task/view/${request.taskId}/`
            : null;

        return [
            `<b>Обращение от ${escapeHtml(request.authorName)}</b>`,
            '',
            escapeHtml(this.text.cardText(request.text)),
            '',
            taskLink ? `Задача: ${taskLink}` : 'Задача не создана',
            chatLink ? `Чат: ${chatLink}` : `Диалог: ${escapeHtml(request.dialogId)}`,
        ].join('\n');
    }

    /** Ждём от оператора текст ответа на конкретную заявку */
    async setAwaiting(chatId: number, requestId: string): Promise<void> {
        await this.redisService
            .getClient()
            .set(awaitingKey(chatId), requestId, 'EX', AWAITING_TTL_SEC);
    }

    async takeAwaiting(chatId: number): Promise<string | null> {
        const redis = this.redisService.getClient();
        const requestId = await redis.get(awaitingKey(chatId));
        if (requestId) await redis.del(awaitingKey(chatId));
        return requestId;
    }

    /** Снимает кнопки со всех карточек заявки: она уже обработана */
    async closeCards(requestId: string): Promise<void> {
        const operators = await this.operators.list(false);
        const chats = operators.map(o => o.telegramChatId);
        const admin = this.api.adminChatId;
        if (admin && !chats.includes(admin)) chats.push(admin);

        const redis = this.redisService.getClient();
        for (const chatId of chats) {
            const key = cardKey(requestId, chatId);
            const messageId = await redis.get(key);
            if (!messageId) continue;
            await this.api.clearKeyboard(chatId, Number(messageId));
            await redis.del(key);
        }
    }
}
