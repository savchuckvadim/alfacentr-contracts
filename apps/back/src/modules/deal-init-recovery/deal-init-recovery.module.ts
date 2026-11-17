import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PBXModule } from '../pbx/pbx.module';
import { TelegramModule } from '../telegram/telegram.module';
import { QueueNames } from '../queue/constants/queue-names.enum';
import { DealInitRecoveryController } from './controller/deal-init-recovery.controller';
import { DealInitRecoveryUseCase } from './use-cases/deal-init-recovery.use-case';

@Module({
    imports: [
        PBXModule,
        TelegramModule,
        //крон не принимает заявку сам, а кладёт её в ту же очередь, что и
        //вебхук: иначе они встречаются на одной сделке и задваивают
        //участников (сделка 204296, 17.11.2026)
        BullModule.registerQueue({ name: QueueNames.DEAL_INIT }),
    ],
    controllers: [DealInitRecoveryController],
    providers: [DealInitRecoveryUseCase],
})
export class DealInitRecoveryModule {}
