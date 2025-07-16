import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DocumentGenerateDto } from "../dto/document-generate.dto";
import { QueueDispatcherService } from "@/modules/queue/dispatch/queue-dispatcher.service";
import { QueueNames } from "@/modules/queue/constants/queue-names.enum";
import { JobNames } from "@/modules/queue/constants/job-names.enum";


@ApiTags('Alfa document-generate')
@Controller('document-generate')
export class DocumentGenerateController {
    constructor(
        private readonly job: QueueDispatcherService
    ) { }
    @Post('')
    async generateDocument(@Body() dto: DocumentGenerateDto) {
        await this.job.dispatch(QueueNames.DOCUMENT, JobNames.DOCUMENT_GENERATE, dto)
        return dto
    }
}