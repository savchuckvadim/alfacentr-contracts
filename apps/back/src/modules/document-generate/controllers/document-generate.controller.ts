import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentGenerateDto } from '../dto/document-generate.dto';
import { QueueDispatcherService } from '@/modules/queue/dispatch/queue-dispatcher.service';
import { QueueNames } from '@/modules/queue/constants/queue-names.enum';
import { JobNames } from '@/modules/queue/constants/job-names.enum';
import { DocumentBitrixGenerateUseCase } from '../use-cases/document-bitrix-generate.use-case';

@ApiTags('Alfa document-generate')
@Controller('document-generate')
export class DocumentGenerateController {
    constructor(
        private readonly job: QueueDispatcherService,
        private readonly useCase: DocumentBitrixGenerateUseCase
    ) { }
    @Post('')
    async generateDocument(@Body() dto: DocumentGenerateDto) {
        await this.job.dispatch(
            QueueNames.DOCUMENT,
            JobNames.DOCUMENT_GENERATE,
            dto,
        );
        return dto;
    }



    //for dev without queue
    // @Post('')
    // async generateDocument(@Body() dto: DocumentGenerateDto) {
    //     return await this.useCase.generateDocumentAndPushToBx(dto);
    // }
}
