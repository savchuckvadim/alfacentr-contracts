import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@/core/redis/redis.module';
import { BotCoreModule } from '../bot-core';
import { BitrixBotModule } from '../bitrix-bot';
import { TelegramApiService } from './services/telegram-api.service';
import { TelegramChannelService } from './services/telegram-channel.service';
import { HandleTelegramUpdateUseCase } from './use-cases/handle-telegram-update.use-case';
import { TelegramBotController } from './controller/telegram-bot.controller';

/**
 * Телеграм как пульт: карточки заявок, кнопки, ответы, операторы,
 * делегирование. Обращения сюда не приходят — они приходят из Битрикса.
 *
 * Зависит от канала Битрикса только ради отправки ответа и работы с задачей.
 * Обратной зависимости нет: битриксовый модуль работает и без телеграма.
 */
@Module({
    imports: [ConfigModule, RedisModule, BotCoreModule, BitrixBotModule],
    controllers: [TelegramBotController],
    providers: [TelegramApiService, TelegramChannelService, HandleTelegramUpdateUseCase],
    exports: [TelegramApiService],
})
export class TelegramBotModule {}
