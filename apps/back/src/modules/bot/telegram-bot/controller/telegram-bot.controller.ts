import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HandleTelegramUpdateUseCase } from '../use-cases/handle-telegram-update.use-case';
import { TelegramApiService } from '../services/telegram-api.service';
import { ITelegramUpdate } from '../types/telegram-update.type';

@ApiTags('Bot')
@Controller('bot/telegram')
export class TelegramBotController {
    private readonly logger = new Logger(TelegramBotController.name);

    constructor(
        private readonly handleUpdate: HandleTelegramUpdateUseCase,
        private readonly api: TelegramApiService,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Приёмник обновлений Телеграма.
     *
     * Отвечает сразу и всегда 200: на ошибку Телеграм начнёт повторять
     * доставку того же обновления, а обработка бывает долгой.
     */
    @ApiOperation({ summary: 'Telegram updates', description: 'message и callback_query' })
    @Post('update')
    receiveUpdate(@Body() body: ITelegramUpdate) {
        void this.handleUpdate.handle(body).catch(error => {
            this.logger.error(
                `Обновление ${body?.update_id ?? '?'} не обработано: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        });
        return { ok: true };
    }

    @ApiOperation({
        summary: 'Set telegram webhook',
        description: 'Разовое административное действие, как и регистрация бота в Битриксе',
    })
    @Post('set-webhook')
    async setWebhook() {
        const base = (this.configService.get<string>('PUBLIC_API_URL') || '').replace(
            /\/+$/,
            '',
        );
        if (!base) {
            return { result: { ok: false, message: 'Не задан PUBLIC_API_URL' } };
        }
        const url = `${base}/api/bot/telegram/update`;
        const ok = await this.api.setWebhook(url);
        this.logger.log(`Вебхук Телеграма ${ok ? 'установлен' : 'не установлен'}: ${url}`);
        return { result: { ok, url } };
    }
}
