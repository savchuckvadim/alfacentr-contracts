import { Process, Processor } from '@nestjs/bull';
import { QueueNames } from 'src/modules/queue/constants/queue-names.enum';
import { JobNames } from 'src/modules/queue/constants/job-names.enum';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { DocumentNumberByPrefixDto } from '../dto/document-number.dto';
import { DocumentNumberByPrefixUseCase } from '../use-cases/document-number-by-prefix.use-case';
import { WsEventsService, WsEvents } from '@/core/ws';

@Processor(QueueNames.DOCUMENT_NUMBER_BY_PREFIX)
export class DocumentNumberByPrefixQueueProcessor {
    private readonly logger = new Logger(QueueNames.DOCUMENT_NUMBER_BY_PREFIX);

    constructor(
        private readonly useCase: DocumentNumberByPrefixUseCase,
        private readonly wsEvents: WsEventsService, // WebSocket Events сервис
    ) {
        this.logger.log('DocumentNumberByPrefixQueueProcessor initialized');
    }

    @Process({
        name: JobNames.DOCUMENT_NUMBER_BY_PREFIX,
        concurrency: 1,
    })
    async handle(job: Job<DocumentNumberByPrefixDto>) {
        const dto = job.data;
        const { socketId, dealId } = dto;

        // console.log('✅ DOCUMENT_NUMBER_BY_PREFIX dto ', dto);

        try {
            const result = await this.useCase.execute(dto);

            // Отправляем событие успешного выполнения
            this.wsEvents.emit(
                WsEvents.DocumentNumberGenerated,
                {
                    ...result,
                    message: 'Document number by prefix generated successfully',
                },
                { socketId, dealId: dealId.toString() },
            );
        } catch (error) {
            console.error('❌ Error in document number generation:', error);

            // Отправляем событие ошибки
            this.wsEvents.emit(
                WsEvents.DocumentNumberGenerated,
                {
                    message:
                        error.message || 'Failed to generate document number',
                },
                { socketId, dealId: dealId.toString() },
            );
        }
    }
}
