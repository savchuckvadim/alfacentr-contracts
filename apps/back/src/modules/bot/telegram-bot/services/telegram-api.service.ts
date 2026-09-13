import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITelegramInlineButton } from '../types/telegram-update.type';

const API_BASE = 'https://api.telegram.org';
const CALL_ATTEMPTS = 3;
const CALL_RETRY_DELAY_MS = 500;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Тонкий клиент Telegram Bot API.
 *
 * Существующий TelegramService в бэкенде умеет только послать текст админу —
 * этого мало: нужны кнопки, ответы на нажатия и правка уже отправленных
 * сообщений. Его не трогаем: он используется для уведомлений об ошибках, и
 * ломать этот путь ради бота нельзя.
 */
@Injectable()
export class TelegramApiService {
    private readonly logger = new Logger(TelegramApiService.name);
    private readonly token: string | null;

    constructor(private readonly configService: ConfigService) {
        const raw = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
        this.token = raw ? raw.replace(/^"|"$/g, '') : null;
        if (!this.token) {
            this.logger.warn(
                'TELEGRAM_BOT_TOKEN не задан: телеграм-канал бота работать не будет',
            );
        }
    }

    get isReady(): boolean {
        return Boolean(this.token);
    }

    get adminChatId(): number | null {
        const raw = this.configService.get<string>('TELEGRAM_ADMIN_CHAT_ID');
        const id = Number(String(raw ?? '').replace(/"/g, ''));
        return Number.isFinite(id) && id !== 0 ? id : null;
    }

    async sendMessage(
        chatId: number,
        text: string,
        keyboard?: ITelegramInlineButton[][],
    ): Promise<number | null> {
        const result = await this.call<{ result?: { message_id?: number } }>(
            'sendMessage',
            {
                chat_id: chatId,
                text,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                ...(keyboard?.length
                    ? { reply_markup: { inline_keyboard: keyboard } }
                    : {}),
            },
        );
        return result?.result?.message_id ?? null;
    }

    /** Просит оператора прислать текст ответа следующим сообщением */
    async askForText(chatId: number, text: string): Promise<void> {
        await this.call('sendMessage', {
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            reply_markup: { force_reply: true, input_field_placeholder: 'Текст ответа' },
        });
    }

    /**
     * Ответ на нажатие обязателен: без него у оператора кнопка «висит»
     * в состоянии загрузки, и он жмёт её повторно.
     */
    async answerCallback(callbackId: string, text?: string): Promise<void> {
        await this.call('answerCallbackQuery', {
            callback_query_id: callbackId,
            ...(text ? { text, show_alert: false } : {}),
        });
    }

    /** Снимает кнопки с карточки: заявка уже обработана */
    async clearKeyboard(chatId: number, messageId: number): Promise<void> {
        await this.call('editMessageReplyMarkup', {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: [] },
        });
    }

    /** Разовое административное действие, как и регистрация бота в Битриксе */
    async setWebhook(url: string): Promise<boolean> {
        const result = await this.call<{ ok?: boolean }>('setWebhook', {
            url,
            allowed_updates: ['message', 'callback_query'],
        });
        return Boolean(result?.ok);
    }

    private async call<T>(method: string, payload: unknown): Promise<T | null> {
        if (!this.token) return null;

        let lastError: unknown;
        for (let attempt = 1; attempt <= CALL_ATTEMPTS; attempt++) {
            try {
                const response = await fetch(
                    `${API_BASE}/bot${this.token}/${method}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    },
                );
                const json = (await response.json()) as
                    | { ok?: boolean; description?: string }
                    | null;
                if (!response.ok || !json?.ok) {
                    throw new Error(
                        `HTTP ${response.status} ${json?.description ?? ''}`.trim(),
                    );
                }
                return json as T;
            } catch (error) {
                lastError = error;
                this.logger.warn(
                    `Telegram ${method}: попытка ${attempt} из ${CALL_ATTEMPTS} — ${
                        error instanceof Error ? error.message : String(error)
                    }`,
                );
                if (attempt < CALL_ATTEMPTS) await sleep(CALL_RETRY_DELAY_MS * attempt);
            }
        }
        this.logger.error(
            `Telegram ${method}: все попытки неудачны — ${
                lastError instanceof Error ? lastError.message : String(lastError)
            }`,
        );
        return null;
    }
}
