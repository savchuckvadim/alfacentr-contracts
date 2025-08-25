import { Module } from '@nestjs/common';
import { OnDealInitController } from './controller/on-deal-init.controller';
import { OnDealInitUseCase } from './use-cases/on-deal-init.use-case';
import { PBXModule } from '../pbx/pbx.module';
import { FrontDealUseCase } from './use-cases/front-deal.use-case';
import { RedisModule } from '@/core/redis/redis.module';

@Module({
    controllers: [OnDealInitController],
    imports: [PBXModule, RedisModule],
    providers: [OnDealInitUseCase, FrontDealUseCase],
})
export class OnDealInitModule {}
