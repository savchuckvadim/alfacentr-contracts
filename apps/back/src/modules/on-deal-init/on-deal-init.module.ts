import { Module } from '@nestjs/common';
import { OnDealInitController } from './controller/on-deal-init.controller';
import { OnDealInitUseCase } from './use-cases/on-deal-init.use-case';
import { PBXModule } from '../pbx/pbx.module';

@Module({
    controllers: [OnDealInitController],
    imports: [PBXModule],
    providers: [OnDealInitUseCase],
})
export class OnDealInitModule { }   