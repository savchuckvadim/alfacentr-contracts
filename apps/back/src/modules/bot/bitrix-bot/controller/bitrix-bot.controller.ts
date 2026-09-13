import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HandleBitrixBotMessageUseCase } from '../use-cases/handle-bitrix-bot-message.use-case';
import { BitrixBotRegistrarService } from '../services/bitrix-bot-registrar.service';
import {
    BITRIX_BOT_EVENTS,
    IBitrixBotEventBody,
    IBitrixBotMessage,
} from '../types/bitrix-bot-event.type';

@ApiTags('Bot')
@Controller('bot/bitrix')
export class BitrixBotController {
    private readonly logger = new Logger(BitrixBotController.name);

    constructor(
        private readonly handleMessage: HandleBitrixBotMessageUseCase,
        private readonly registrar: BitrixBotRegistrarService,
    ) {}

    /**
     * Приёмник событий бота.
     *
     * Отвечает сразу и всегда 200: Битрикс на ошибку начнёт повторять доставку,
     * а обработка может быть долгой. Работа идёт в фоне, ошибки — в лог.
     */
    @ApiOperation({
        summary: 'Bitrix bot events',
        description: 'ONIMBOTMESSAGEADD, ONIMBOTJOINCHAT, ONIMBOTDELETE',
    })
    @Post('event')
    receiveEvent(@Body() body: IBitrixBotEventBody) {
        const event = String(body?.event || '').toUpperCase();

        // Намеренно без await: эндпоинт должен ответить немедленно
        void this.process(event, body).catch(error => {
            this.logger.error(
                `Событие ${event} не обработано: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        });

        return { result: 'accepted' };
    }

    @ApiOperation({
        summary: 'Register bitrix bot',
        description:
            'Разовое административное действие: регистрирует бота или обновляет его обработчики',
    })
    @Post('register')
    async register() {
        const result = await this.registrar.ensureRegistered();
        this.logger.log(`Регистрация бота: ${result.action} — ${result.message}`);
        return { result };
    }

    private async process(event: string, body: IBitrixBotEventBody): Promise<void> {
        if (event === BITRIX_BOT_EVENTS.messageAdd) {
            const message = this.parseMessage(event, body);
            if (!message) {
                this.logger.warn('Событие сообщения без диалога или текста, пропускаю');
                return;
            }
            await this.handleMessage.handleMessage(message);
            return;
        }

        if (event === BITRIX_BOT_EVENTS.joinChat) {
            const dialogId = String(body?.data?.PARAMS?.DIALOG_ID || '');
            if (dialogId) await this.handleMessage.handleJoinChat(dialogId);
            return;
        }

        if (event === BITRIX_BOT_EVENTS.botDelete) {
            this.logger.warn('Бот удалён с портала: события больше не придут');
            return;
        }

        this.logger.log(`Событие ${event} не обрабатывается`);
    }

    private parseMessage(
        event: string,
        body: IBitrixBotEventBody,
    ): IBitrixBotMessage | null {
        const params = body?.data?.PARAMS;
        const user = body?.data?.USER;
        const dialogId = String(params?.DIALOG_ID || '');
        if (!dialogId) return null;

        const botEntry = Object.values(body?.data?.BOT || {})[0];
        const isFromBot =
            user?.IS_BOT === true ||
            String(user?.IS_BOT || '').toUpperCase() === 'Y' ||
            String(user?.IS_BOT || '') === 'true';

        const name = [user?.NAME || user?.FIRST_NAME, user?.LAST_NAME]
            .filter(Boolean)
            .join(' ')
            .trim();

        return {
            event,
            dialogId,
            messageId: String(params?.MESSAGE_ID || ''),
            text: String(params?.MESSAGE || ''),
            authorId: Number(params?.FROM_USER_ID || user?.ID || 0),
            authorName: name || `Пользователь ${user?.ID || '?'}`,
            isFromBot,
            botId: Number(botEntry?.BOT_ID) || null,
        };
    }
}
