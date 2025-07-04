import { Module } from "@nestjs/common";
import { AlfaDealProductsController } from "./controller/alfa-deal-products.controller";
import { AlfaDealProductsUseCase } from "./use-case/alfa-deal-products.use-case";
import { PBXModule } from "../pbx";

@Module({
    imports: [PBXModule],
    controllers: [AlfaDealProductsController],
    providers: [AlfaDealProductsUseCase],
    exports: [AlfaDealProductsUseCase]
})
export class AlfaProductsModule { }