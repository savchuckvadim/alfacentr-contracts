import { Process, Processor } from '@nestjs/bull';
import { QueueNames } from 'src/modules/queue/constants/queue-names.enum';
import { JobNames } from 'src/modules/queue/constants/job-names.enum';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

import { TelegramService } from '@/modules/telegram/telegram.service';
import { DocumentEmailService } from '../services/document-email.service';
import { DocumentEmailDto } from '../dtos/document-email.dto';


@Processor(QueueNames.DOCUMENT_EMAIL)
export class DocumentEmailSendQueueProcessor {
    private readonly logger = new Logger(QueueNames.DOCUMENT_EMAIL);

    constructor(
        private readonly useCase: DocumentEmailService,
        private readonly telegramService: TelegramService,

        /// NO!! scope: REQUEST
    ) {
        this.logger.log('DocumentEmailSendQueueProcessor initialized');
        // this.logger.log(this.portalService.getHook)
    }

    @Process(JobNames.DOCUMENT_EMAIL_SEND)
    async handle(job: Job<DocumentEmailDto>) {
        const dto = job.data;
        this.logger.log('DOCUMENT EMAIL SEND HANDLE');
        this.logger.log(dto.domain);

        await this.useCase.sendDocumentEmail(dto);
        await this.telegramService.sendMessage(
            'ALFA DOCUMENT EMAIL SEND Queue: Document email sent successfully',
        );
    }
}
