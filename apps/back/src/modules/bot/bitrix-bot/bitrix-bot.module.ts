import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PBXModule } from '@/modules/pbx/pbx.module';
import { BotCoreModule } from '../bot-core';
import { BitrixBotConfigService } from './services/bitrix-bot-config.service';
import { BitrixBotApiService } from './services/bitrix-bot-api.service';
import { BitrixBotRegistrarService } from './services/bitrix-bot-registrar.service';
import { HandleBitrixBotMessageUseCase } from './use-cases/handle-bitrix-bot-message.use-case';
import { BitrixBotController } from './controller/bitrix-bot.controller';

/**
 * Канал Битрикса: приём событий чат-бота, ответы в чат, задачи из обращений.
 *
 * Отделён от телеграм-канала намеренно: любой из двух должен выключаться,
 * не останавливая другой.
 */
@Module({
    imports: [ConfigModule, PBXModule, BotCoreModule],
    controllers: [BitrixBotController],
    providers: [
        BitrixBotConfigService,
        BitrixBotApiService,
        BitrixBotRegistrarService,
        HandleBitrixBotMessageUseCase,
    ],
    exports: [BitrixBotApiService, BitrixBotConfigService],
})
export class BitrixBotModule {}
