import { Controller, Post, Body, Logger, Param, ValidationPipe, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentNumberDto } from '../dto/document-number.dto';
import { QueueDispatcherService } from '@/modules/queue/dispatch/queue-dispatcher.service';
import { QueueNames } from '@/modules/queue/constants/queue-names.enum';
import { JobNames } from '@/modules/queue/constants/job-names.enum';

@ApiTags('Alfa')
@Controller('seminar')
export class DocumentNumberController {
    constructor(
        private readonly job: QueueDispatcherService


    ) { }

    @ApiOperation({ summary: 'Document number', description: 'Generate document number' })
    @Post('document-number/:dealId')
    async createDeal(
        @Body(ValidationPipe) body: DocumentNumberDto,
        @Param('dealId') dealId: string
    ) {
        const fullDto = { ...body, dealId: Number(dealId) };

        await this.job.dispatch(
            QueueNames.DOCUMENT_NUMBER,
            JobNames.DOCUMENT_NUMBER,
            fullDto
        );
        return { result: 'job got to queue' }
    }


}