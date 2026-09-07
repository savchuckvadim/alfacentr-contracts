import { Module } from '@nestjs/common';
import { PBXModule } from '../pbx/pbx.module';
import { TelegramModule } from '../telegram/telegram.module';
import { OnDealInitModule } from '../on-deal-init/on-deal-init.module';
import { DealInitRecoveryController } from './controller/deal-init-recovery.controller';
import { DealInitRecoveryUseCase } from './use-cases/deal-init-recovery.use-case';

@Module({
    imports: [PBXModule, TelegramModule, OnDealInitModule],
    controllers: [DealInitRecoveryController],
    providers: [DealInitRecoveryUseCase],
})
export class DealInitRecoveryModule {}
