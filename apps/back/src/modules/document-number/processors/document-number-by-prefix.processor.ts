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
            this.logger.error(
                `Не удалось выдать номер по префиксу «${
                    dto.dinamycPrefix || dto.prefix
                }» для сделки ${dealId}: ${error.message}`,
            );

            // Раньше здесь возвращался фиксированный counter: 334. Любые две
            // ошибки подряд давали двум договорам один номер, поэтому номер
            // при ошибке не выдаём вовсе — фронт показывает ошибку.
            this.wsEvents.emit(
                WsEvents.DocumentNumberGenerated,
                {
                    prefix: dto.dinamycPrefix || dto.prefix,
                    counter: null,
                    error: true,
                    message:
                        error.message || 'Failed to generate document number',
                },
                { socketId, dealId: dealId.toString() },
            );
        }
    }
}
