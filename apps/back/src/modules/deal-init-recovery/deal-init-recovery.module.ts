import { Module } from '@nestjs/common';
import { PBXModule } from '../pbx/pbx.module';
import { TelegramModule } from '../telegram/telegram.module';
//очередь приёма и единственная дверь в неё — DealInitEnqueueService —
//живут в модуле приёма: вебхук и крон обязаны ходить одним путём, иначе
//они встречаются на одной сделке и задваивают участников (сделка 204296,
//17.11.2026) или упираются в чужую упавшую задачу (20.11.2026)
import { OnDealInitModule } from '../on-deal-init/on-deal-init.module';
import { DealInitRecoveryController } from './controller/deal-init-recovery.controller';
import { DealInitRecoveryUseCase } from './use-cases/deal-init-recovery.use-case';

@Module({
    imports: [PBXModule, TelegramModule, OnDealInitModule],
    controllers: [DealInitRecoveryController],
    providers: [DealInitRecoveryUseCase],
})
export class DealInitRecoveryModule {}
