import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { OnDealInitController } from './controller/on-deal-init.controller';
import { OnDealInitUseCase } from './use-cases/on-deal-init.use-case';
import { PBXModule } from '../pbx/pbx.module';
import { FrontDealUseCase } from './use-cases/front-deal.use-case';
import { RedisModule } from '@/core/redis/redis.module';
import { GetDealBidItemsUseCase } from './use-cases/get-deal-bid-items.use-case';
import { InitialBidTypeService } from '../../lib/deal-helper/initial-contract-type.service';
import { TelegramModule } from '../telegram/telegram.module';
import { QueueNames } from '../queue/constants/queue-names.enum';
import { DealInitProcessor } from './processors/deal-init.processor';
import { DealInitLockService } from './services/deal-init-lock.service';
import { DealInitEnqueueService } from './services/deal-init-enqueue.service';

@Module({
    controllers: [OnDealInitController],
    imports: [
        PBXModule,
        RedisModule,
        TelegramModule,
        //очередь приёма заявки: вебхук только кладёт задачу и отвечает сразу
        BullModule.registerQueue({ name: QueueNames.DEAL_INIT }),
    ],
    providers: [
        OnDealInitUseCase,
        FrontDealUseCase,
        GetDealBidItemsUseCase,
        InitialBidTypeService,
        DealInitProcessor,
        DealInitLockService,
        DealInitEnqueueService,
    ],
    //GetDealBidItemsUseCase нужен фронту. OnDealInitUseCase больше никем
    //снаружи не берётся: крон подхвата теперь кладёт сделку в очередь, а не
    //принимает сам — приём идёт только через процессор этого модуля
    //DealInitEnqueueService — единственная дверь в очередь приёма: через
    //неё ходят и вебхук, и крон подхвата
    exports: [GetDealBidItemsUseCase, OnDealInitUseCase, DealInitEnqueueService],
})
export class OnDealInitModule {}
