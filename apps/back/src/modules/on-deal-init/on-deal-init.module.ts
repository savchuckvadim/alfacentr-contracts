import { Module } from '@nestjs/common';
import { OnDealInitController } from './controller/on-deal-init.controller';
import { OnDealInitUseCase } from './use-cases/on-deal-init.use-case';
import { PBXModule } from '../pbx/pbx.module';
import { FrontDealUseCase } from './use-cases/front-deal.use-case';
import { RedisModule } from '@/core/redis/redis.module';
import { GetDealBidItemsUseCase } from './use-cases/get-deal-bid-items.use-case';

@Module({
    controllers: [OnDealInitController],
    imports: [PBXModule, RedisModule],
    providers: [OnDealInitUseCase, FrontDealUseCase, GetDealBidItemsUseCase],
    exports: [GetDealBidItemsUseCase],
})
export class OnDealInitModule {}
