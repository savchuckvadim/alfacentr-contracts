import { Module } from '@nestjs/common';
import { PBXModule } from '../pbx/pbx.module';
import { TelegramModule } from '../telegram/telegram.module';
import { PpkScheduleController } from './controller/ppk-schedule.controller';
import { PpkScheduleUseCase } from './use-cases/ppk-schedule.use-case';

@Module({
    imports: [PBXModule, TelegramModule],
    controllers: [PpkScheduleController],
    providers: [PpkScheduleUseCase],
    exports: [PpkScheduleUseCase],
})
export class PpkScheduleModule {}
