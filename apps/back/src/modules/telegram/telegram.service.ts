import { HttpService } from '@nestjs/axios';
import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * Прод-бэк, через который уходят сообщения, если из окружения приложения
 * telegram недоступен напрямую. У ручки строгий dto:
 * { app, text, domain, userId } — все поля непустые строки
 */
const PUBLIC_TELEGRAM_URL = 'https://back.april-dev.ru/api/telegram';

//лимиты dto публичной ручки (и самого telegram)
const TELEGRAM_TEXT_MAX_LENGTH = 4000;
const TELEGRAM_FIELD_MAX_LENGTH = 200;

/**
 * Отправка сообщений в telegram. Два режима (env WITH_TELEGRAM):
 *  - 'true'  — напрямую в Bot API (нужны TELEGRAM_BOT_TOKEN и TELEGRAM_ADMIN_CHAT_ID);
 *  - иначе   — пересылка на прод-бэк (PUBLIC_TELEGRAM_URL), который шлет сам.
 *
 * Второй режим — основной для этого приложения: оно развернуто там,
 * где telegram напрямую не работает.
 *
 * Инвариант: отправка НИКОГДА не роняет вызвавший поток. Потерянное
 * уведомление — это потерянное уведомление, а не сломанная бизнес-операция.
 */
@Global()
@Injectable()
export class TelegramService {
    private readonly botToken: string;
    private readonly adminChatId: string;
    private readonly appName: string;
    private readonly domain: string;
    private readonly withTelegram: boolean;
    private readonly url: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.withTelegram =
            this.configService.get<string>('WITH_TELEGRAM') === 'true';
        this.botToken = this.configService.get<string>(
            'TELEGRAM_BOT_TOKEN',
        ) as string;
        this.adminChatId = this.configService.get<string>(
            'TELEGRAM_ADMIN_CHAT_ID',
        ) as string;
        this.appName =
            this.configService.get<string>('APP_NAME') || 'alfacentr';
        this.domain =
            this.configService.get<string>('BITRIX_DOMAIN') ||
            'alfacentr.bitrix24.ru';

        this.url =
            this.withTelegram && this.botToken
                ? `https://api.telegram.org/bot${this.botToken}/sendMessage`
                : PUBLIC_TELEGRAM_URL;
    }

    async sendMessage(message: string) {
        await this.post(this.getPayload(`NEST ${message}`));
    }

    async sendMessageAdminError(message: string) {
        await this.post(this.getPayload(`NEST ADMIN ERROR: ${message}`));
    }

    /**
     * Единая точка отправки. Ошибку гасим здесь: у публичной ручки строгая
     * валидация dto, и 400 не должен ронять прием заявки или генерацию документов
     */
    private async post(payload: unknown): Promise<void> {
        try {
            await firstValueFrom(this.httpService.post(this.url, payload));
        } catch (error) {
            const reason =
                error instanceof Error ? error.message : String(error);
            console.error('Telegram error:', reason);
        }
    }

    private getPayload(text: string) {
        const cleanText = this.cleanText(text);

        if (this.withTelegram) {
            return {
                chat_id: this.adminChatId,
                text: cleanText,
                parse_mode: 'Markdown',
            };
        }

        //dto прод-бэка: все поля обязательны и непустые
        return {
            app: this.cutField(this.appName),
            text: cleanText,
            domain: this.cutField(this.domain),
            userId: this.cutField(this.adminChatId),
        };
    }

    private cutField(value: string) {
        const result = String(value || '').trim();
        return (result || '-').slice(0, TELEGRAM_FIELD_MAX_LENGTH);
    }

    private cleanText(text: string) {
        const result = String(text || '')
            .replace(/_/g, '\\_')
            .replace(/\*/g, '\\*')
            .replace(/\[/g, '\\[')
            .replace(/`/g, '\\`')
            .replace(/[_*[\]()~`>#+=|{}.!\\]/g, '\\$&') // экранируем ВСЁ, что может сломать markdown
            .slice(0, TELEGRAM_TEXT_MAX_LENGTH); // telegram лимит: 4096 символов

        //dto не пропустит пустой текст
        return result.trim() || '-';
    }
}
