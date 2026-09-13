import { Module } from '@nestjs/common';
import { RedisModule } from '@/core/redis/redis.module';
import { BotRequestStore } from './stores/bot-request.store';
import { BotOperatorStore } from './stores/bot-operator.store';
import { BotChannelRegistry } from './services/bot-channel-registry.service';
import { BotRequestTextService } from './services/bot-request-text.service';

/**
 * Ядро бота: заявки, операторы, реестр каналов и правила текста.
 *
 * Про Битрикс и Телеграм ядро не знает ничего — каналы подключаются к нему,
 * а не наоборот.
 */
@Module({
    imports: [RedisModule],
    providers: [
        BotRequestStore,
        BotOperatorStore,
        BotChannelRegistry,
        BotRequestTextService,
    ],
    exports: [
        BotRequestStore,
        BotOperatorStore,
        BotChannelRegistry,
        BotRequestTextService,
    ],
})
export class BotCoreModule {}
