import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentGenerateDto } from '../dto/document-generate.dto';
import { IsDealReadyForSendDto } from '../dto/is-deal-ready-for-send.dto';
import { IsDealReadyForSendUseCase } from '../use-cases/is-deal-ready-for-send.use-case';
import { QueueDispatcherService } from '@/modules/queue/dispatch/queue-dispatcher.service';
import { QueueNames } from '@/modules/queue/constants/queue-names.enum';
import { JobNames } from '@/modules/queue/constants/job-names.enum';

@ApiTags('Alfa document-generate')
@Controller('document-generate')
export class DocumentGenerateController {
    constructor(
        private readonly job: QueueDispatcherService,
        private readonly isDealReadyForSendUseCase: IsDealReadyForSendUseCase,
    ) {}
    @Post('')
    async generateDocument(@Body() dto: DocumentGenerateDto) {
        await this.job.dispatch(
            QueueNames.DOCUMENT,
            JobNames.DOCUMENT_GENERATE,
            dto,
        );
        return dto;
    }

    @ApiOperation({
        summary:
            'Проверка что все поля сделки с документами заполнены (по типу договора)',
    })
    @Post('is-deal-ready-for-send')
    async isDealReadyForSend(
        @Body() dto: IsDealReadyForSendDto,
    ): Promise<boolean> {
        return await this.isDealReadyForSendUseCase.isDealReadyForSend(dto);
    }

    //for dev without queue
    // @Post('')
    // async generateDocument(@Body() dto: DocumentGenerateDto) {
    //     return await this.useCase.generateDocumentAndPushToBx(dto);
    // }
}
