import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DocumentEmailDto, DocumentEmailQueryDto } from '../dtos/document-email.dto';
import { BxWebHookDto } from '@/modules/bitrix';
import { QueueDispatcherService } from '@/modules/queue/dispatch/queue-dispatcher.service';

import { QueueNames } from '@/modules/queue/constants/queue-names.enum';
import { JobNames } from '@/modules/queue/constants/job-names.enum';


@ApiTags('Alfa Document Send Email')
@Controller('document-email')
export class DocumentEmailController {
    constructor(
        // private readonly documentEmailService: DocumentEmailService,
        private readonly job: QueueDispatcherService
    ) { }

    @Post('send-document-email')
    @ApiOperation({ summary: 'Send document email' })
    @ApiBody({ type: BxWebHookDto })
    @ApiResponse({
        status: 200,
        description: 'Document email sent',
    })
    async sendDocumentEmail(@Body() body: BxWebHookDto, @Query() query: DocumentEmailQueryDto) {

        const dto = {
            ...query,
            domain: body?.auth?.domain,
        } as DocumentEmailDto;
        // const result = await this.documentEmailService.sendDocumentEmail(dto);
        // return result;
        console.log('Controller dto', dto);
        await this.job.dispatch(
            QueueNames.DOCUMENT_EMAIL,
            JobNames.DOCUMENT_EMAIL_SEND,
            dto,
        );
        return dto;
    }
}
