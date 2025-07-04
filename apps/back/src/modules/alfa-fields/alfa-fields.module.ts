import { Module } from "@nestjs/common";
import { AlfaFieldsController } from "./controller/alfa-fields.controller";
import { AlfaFieldUseCase } from "./use-case/alfa-field.use-case";
import { PBXModule } from "../pbx";

@Module({
    imports: [PBXModule],
    controllers: [AlfaFieldsController],
    providers: [AlfaFieldUseCase],
    exports: [AlfaFieldUseCase]
})
export class AlfaFieldsModule { }