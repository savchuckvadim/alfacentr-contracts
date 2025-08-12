import { Module } from '@nestjs/common';
import { AlfaDealProductsController } from './controller/alfa-deal-products.controller';
import { AlfaDealProductsUseCase } from './use-case/alfa-deal-products.use-case';
import { PBXModule } from '../pbx';
import { AlfaBxProductsController } from './controller/alfa-bx-products.controller';

@Module({
    imports: [PBXModule],
    controllers: [AlfaDealProductsController, AlfaBxProductsController],
    providers: [AlfaDealProductsUseCase],
    exports: [AlfaDealProductsUseCase],
})
export class AlfaProductsModule {}
