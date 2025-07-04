
import { Module } from "@nestjs/common";
import { DocumentInfoblockService } from "./infoblocks/infoblock.service";
import { DocumentClientBxRqService } from "./bx-client-rq/bx-client-rq.service";
@Module({

    providers: [
       
        DocumentInfoblockService,
        DocumentClientBxRqService
    ],
    exports: [
       
        DocumentInfoblockService,
        DocumentClientBxRqService
    ],
})
export class DocumentGenerateModule { }


