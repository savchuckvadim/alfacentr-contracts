import { Injectable, Logger } from '@nestjs/common';
import {
    BotChannelRegistry,
    BotRequestStore,
    BotRequestTextService,
} from '../../bot-core';
import { BitrixBotApiService } from '../services/bitrix-bot-api.service';
import { BitrixBotConfigService } from '../services/bitrix-bot-config.service';
import { IBitrixBotMessage } from '../types/bitrix-bot-event.type';

/** Единственный автоматический ответ бота: он ничего не обещает по существу */
const ACK_TEXT = 'Добрый день. Информацию получил — изучаю.';

const WELCOME_TEXT = [
    'Добрый день. Я собираю обращения по семинарам.',
    '',
    'Упомяните меня в сообщении — и на него появится задача, а ответ придёт сюда же.',
    'Сообщения без упоминания я не читаю: обсуждайте между собой спокойно.',
].join('\n');

@Injectable()
export class HandleBitrixBotMessageUseCase {
    private readonly logger = new Logger(HandleBitrixBotMessageUseCase.name);

    constructor(
        private readonly requests: BotRequestStore,
        private readonly text: BotRequestTextService,
        private readonly api: BitrixBotApiService,
        private readonly config: BitrixBotConfigService,
        private readonly channels: BotChannelRegistry,
    ) {}

    /**
     * Обращение из чата: заявка, задача, подтверждение в чат, карточка оператору.
     *
     * В групповом чате событие приходит только при упоминании бота, поэтому
     * отличать адресованное от разговора людей не требуется — это делает сам
     * Битрикс.
     */
    async handleMessage(message: IBitrixBotMessage): Promise<void> {
        // Защита от эха: событие приходит и на сообщения самого бота, иначе
        // подтверждение вызвало бы новое событие и бот ушёл бы в цикл
        if (message.isFromBot) return;
        if (!this.text.isRequest(message.text)) {
            this.logger.log(
                `Сообщение ${message.messageId} из ${message.dialogId} пустое по смыслу, заявка не создаётся`,
            );
            return;
        }

        const { request, created } = await this.requests.createIfAbsent({
            channel: 'bitrix',
            dialogId: message.dialogId,
            messageId: message.messageId,
            authorId: message.authorId,
            authorName: message.authorName,
            text: message.text,
        });

        if (!created) {
            this.logger.log(
                `Событие по сообщению ${message.messageId} уже обработано, заявка ${request.id}`,
            );
            return;
        }

        const taskId = await this.createTask(request.id, message);
        await this.api.sendReply(message.dialogId, ACK_TEXT);
        await this.requests.patch(request.id, { taskId, status: 'acknowledged' });

        const updated = await this.requests.get(request.id);
        if (updated) {
            // Карточка уходит в телеграм-канал. Нет канала — не беда: заявка и
            // задача уже есть, работа не потеряна
            await this.channels.showCard(updated, 'telegram');
        }

        this.logger.log(
            `Обращение от ${message.authorName} из ${message.dialogId}: заявка ${request.id}, задача ${taskId ?? 'не создана'}`,
        );
    }

    /** Приветствие при добавлении бота в чат: сразу объясняем правила */
    async handleJoinChat(dialogId: string): Promise<void> {
        await this.api.sendReply(dialogId, WELCOME_TEXT);
    }

    private async createTask(
        requestId: string,
        message: IBitrixBotMessage,
    ): Promise<number | null> {
        const link = this.messageLink(message.dialogId);
        const description = [
            this.text.clean(message.text),
            '',
            `Автор: ${message.authorName} (id ${message.authorId})`,
            link ? `Чат: ${link}` : `Чат: ${message.dialogId}`,
            `Заявка бота: ${requestId}`,
        ].join('\n');

        return await this.api.createTask({
            TITLE: this.text.taskTitle(message.text),
            DESCRIPTION: description,
            GROUP_ID: this.config.taskGroupId,
            RESPONSIBLE_ID: message.authorId,
            CREATED_BY: this.config.botId ?? message.authorId,
        });
    }

    private messageLink(dialogId: string): string | null {
        const chatId = /^chat(\d+)$/.exec(dialogId)?.[1];
        return chatId
            ? `https://${this.config.domain}/online/?IM_DIALOG=chat${chatId}`
            : null;
    }
}
