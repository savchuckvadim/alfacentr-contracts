import { Module } from "@nestjs/common";
import { PBXModule } from "../pbx/pbx.module";

@Module({
    imports: [
        PBXModule
    ],
    controllers: [],
    providers: [],
})
export class DocumentNumberModule { }