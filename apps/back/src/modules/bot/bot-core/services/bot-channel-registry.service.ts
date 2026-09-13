import { Injectable, Logger } from '@nestjs/common';
import { IBotChannel, IBotRequest, TBotChannel } from '../types/bot.types';

/**
 * Реестр каналов.
 *
 * Каналы регистрируют себя при старте, ядро обращается к ним только через
 * контракт. Смысл: телеграм-канал можно выключить, не останавливая
 * битриксовый, а третий канал добавить, не правя первые два.
 */
@Injectable()
export class BotChannelRegistry {
    private readonly logger = new Logger(BotChannelRegistry.name);
    private readonly channels = new Map<TBotChannel, IBotChannel>();

    register(channel: IBotChannel): void {
        this.channels.set(channel.channel, channel);
        this.logger.log(`Канал «${channel.channel}» подключён`);
    }

    get(name: TBotChannel): IBotChannel | null {
        return this.channels.get(name) ?? null;
    }

    /** Ответ уходит в тот канал, откуда пришло обращение */
    async reply(request: IBotRequest, text: string): Promise<boolean> {
        const channel = this.get(request.channel);
        if (!channel) {
            this.logger.warn(
                `Ответ по заявке ${request.id} не отправлен: канал «${request.channel}» не подключён`,
            );
            return false;
        }
        await channel.sendReply(request.dialogId, text);
        return true;
    }

    /**
     * Показать карточку заявки операторам. Канал, который этого не умеет,
     * просто пропускается — это не ошибка.
     */
    async showCard(request: IBotRequest, via: TBotChannel): Promise<boolean> {
        const channel = this.get(via);
        if (!channel?.showRequestCard) {
            this.logger.warn(
                `Карточка заявки ${request.id} не показана: канал «${via}» недоступен или не умеет карточки`,
            );
            return false;
        }
        await channel.showRequestCard(request);
        return true;
    }
}
