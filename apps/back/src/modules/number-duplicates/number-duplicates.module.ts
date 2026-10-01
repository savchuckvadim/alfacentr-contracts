import { Module } from '@nestjs/common';
import { PBXModule } from '../pbx/pbx.module';
import { TelegramModule } from '../telegram/telegram.module';
import { RedisModule } from '@/core/redis/redis.module';
import { NumberDuplicatesController } from './controller/number-duplicates.controller';
import { NumberDuplicatesUseCase } from './use-cases/number-duplicates.use-case';

@Module({
    imports: [PBXModule, TelegramModule, RedisModule],
    controllers: [NumberDuplicatesController],
    providers: [NumberDuplicatesUseCase],
    exports: [NumberDuplicatesUseCase],
})
export class NumberDuplicatesModule {}
