import { Process, Processor } from '@nestjs/bull';
import { QueueNames } from 'src/modules/queue/constants/queue-names.enum';
import { JobNames } from 'src/modules/queue/constants/job-names.enum';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { DocumentNumberUseCase } from '../use-cases/document-number.use-case';
import { DocumentNumberDto } from '../dto/document-number.dto';

@Processor(QueueNames.DOCUMENT_NUMBER)
export class DocumentNumberQueueProcessor {
    private readonly logger = new Logger(QueueNames.DOCUMENT_NUMBER);

    constructor(private readonly useCase: DocumentNumberUseCase) {
        this.logger.log('QueuePingQueueProcessor initialized');
    }

    @Process(JobNames.DOCUMENT_NUMBER)
    async handle(job: Job<DocumentNumberDto>) {
        const dto = job.data;

        await this.useCase.execute(dto);
    }
}
