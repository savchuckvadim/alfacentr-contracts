import { Module } from '@nestjs/common';
import { OnDealInitController } from './controller/on-deal-init.controller';
import { OnDealInitUseCase } from './use-cases/on-deal-init.use-case';
import { PBXModule } from '../pbx/pbx.module';
import { FrontDealUseCase } from './use-cases/front-deal.use-case';
import { RedisModule } from '@/core/redis/redis.module';
import { GetDealBidItemsUseCase } from './use-cases/get-deal-bid-items.use-case';
import { InitialBidTypeService } from '../../lib/deal-helper/initial-contract-type.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
    controllers: [OnDealInitController],
    imports: [PBXModule, RedisModule, TelegramModule],
    providers: [
        OnDealInitUseCase,
        FrontDealUseCase,
        GetDealBidItemsUseCase,
        InitialBidTypeService,
    ],
    exports: [GetDealBidItemsUseCase],
})
export class OnDealInitModule {}
