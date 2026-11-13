import { HttpService } from '@nestjs/axios';
import { Global, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import {
    EgressProxyConfig,
    EgressRoute,
    TELEGRAM_API_HOST,
    parseEgressProxyConfig,
    routeEgress,
} from './egress-route.util';
import {
    TelegramSendWindow,
    toTelegramMarkdownText,
} from './telegram-message.util';

/**
 * Отправка тревог в Telegram.
 *
 * Ходит прямо в Bot API через исходящий прокси (EGRESS_PROXY_*): с
 * российских серверов api.telegram.org не отвечает, а реле на
 * back.april-dev.ru, через которое приложение слало раньше, убрали
 * 29.10.2026 — уведомления молча пропадали, пока это не заметили по
 * отчётам крона подхвата заявок 13.11.2026.
 *
 * WITH_TELEGRAM=true включает отправку (нужны TELEGRAM_BOT_TOKEN и
 * TELEGRAM_ADMIN_CHAT_ID); иначе сообщения отбрасываются с одним
 * предупреждением в лог — молчаливого «как будто отправили» больше нет.
 *
 * Инвариант: отправка НИКОГДА не роняет вызвавший поток. Потерянная
 * тревога — это потерянная тревога, а не сломанный приём заявки.
 */
@Global()
@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);
    private readonly sendWindow = new TelegramSendWindow();
    private readonly proxy: EgressProxyConfig | null;
    private readonly appName: string;
    private readonly adminChatId: string | null;
    /** Адрес sendMessage Bot API; null — отправка выключена или не настроена */
    private readonly url: string | null;
    private readonly disabledReason: string | null;
    private disabledWarned = false;
    private routeWarned = false;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        const read = (key: string): string =>
            (this.configService.get<string>(key) ?? '').trim();

        this.appName = read('APP_NAME') || 'alfacentr';
        this.proxy = parseEgressProxyConfig((key) => read(key) || undefined);

        const token = read('TELEGRAM_BOT_TOKEN');
        const chatId = read('TELEGRAM_ADMIN_CHAT_ID');

        this.disabledReason =
            read('WITH_TELEGRAM') !== 'true'
                ? 'WITH_TELEGRAM не равен true'
                : !token
                  ? 'нет TELEGRAM_BOT_TOKEN'
                  : !chatId
                    ? 'нет TELEGRAM_ADMIN_CHAT_ID'
                    : null;

        this.adminChatId = this.disabledReason ? null : chatId;
        this.url = this.disabledReason
            ? null
            : `https://${TELEGRAM_API_HOST}/bot${token}/sendMessage`;

        if (this.proxy) {
            this.logger.log(
                `Исходящий прокси включён для хостов: ${this.proxy.hosts.join(', ')}`,
            );
        }
    }

    /** Отправка включена и настроена */
    get enabled(): boolean {
        return this.url !== null;
    }

    async sendMessage(message: string): Promise<void> {
        await this.post(
            `NEST ${this.appName}: ${toTelegramMarkdownText(message)}`,
        );
    }

    async sendMessageAdminError(message: string): Promise<void> {
        await this.post(
            `NEST ${this.appName} ADMIN ERROR: ${toTelegramMarkdownText(message)}`,
        );
    }

    /**
     * Единая точка отправки: выключатель, троттлинг, маршрут через прокси и
     * гарантия «не уронить вызвавшего». Все send-методы обязаны ходить
     * через неё — иначе лимит обходится вторым входом.
     */
    private async post(text: string): Promise<void> {
        if (!this.url || !this.adminChatId) {
            if (!this.disabledWarned) {
                this.disabledWarned = true;
                this.logger.warn(
                    `Telegram выключен (${this.disabledReason}) — сообщения не отправляются`,
                );
            }
            return;
        }

        if (!this.sendWindow.tryConsume()) {
            //не error: это штатная защита канала, а не сбой
            this.logger.warn(
                'Telegram: лимит сообщений в минуту исчерпан — отправка пропущена',
            );
            return;
        }

        const route: EgressRoute = routeEgress(this.url, this.proxy);
        this.warnIfDirect(route.viaProxy);

        const payload = {
            chat_id: this.adminChatId,
            text,
            parse_mode: 'Markdown',
        };

        try {
            await firstValueFrom(
                this.httpService.post(route.url, payload, {
                    headers: { ...route.headers },
                }),
            );
        } catch (error) {
            const reason =
                error instanceof Error ? error.message : String(error);
            //console, не this.logger.error: если к логгеру когда-нибудь
            //прицепят telegram-транспорт, ошибка отправки зациклит себя
            console.error('Telegram error:', reason);
        }
    }

    /**
     * Один раз за процесс: Bot API идёт мимо прокси. С российского сервера
     * такие сообщения пропадут — почти наверняка забыли api.telegram.org
     * в EGRESS_PROXY_HOSTS.
     */
    private warnIfDirect(viaProxy: boolean): void {
        if (viaProxy || this.routeWarned) return;
        this.routeWarned = true;
        this.logger.warn(
            this.proxy
                ? `Telegram идёт напрямую: ${TELEGRAM_API_HOST} нет в списке хостов прокси (${this.proxy.hosts.join(', ')})`
                : 'Telegram идёт напрямую: исходящий прокси не настроен (EGRESS_PROXY_URL)',
        );
    }
}
