import { Process, Processor } from '@nestjs/bull';
import { QueueNames } from 'src/modules/queue/constants/queue-names.enum';
import { JobNames } from 'src/modules/queue/constants/job-names.enum';
import { Job } from 'bull';
import { WsService } from '@/core/ws';
import { Logger } from '@nestjs/common';
import { DocumentBitrixGenerateUseCase } from '../use-cases/document-bitrix-generate.use-case';
import { DocumentGenerateDto } from '../dto/document-generate.dto';
import { TelegramService } from '@/modules/telegram/telegram.service';


@Processor(QueueNames.DOCUMENT)
export class DocumentGenerateQueueProcessor {
    private readonly logger = new Logger(QueueNames.DOCUMENT);

    constructor(
        private readonly useCase: DocumentBitrixGenerateUseCase,
        private readonly ws: WsService, // WebSocket шлюз
        private readonly telegramService: TelegramService,

        /// NO!! scope: REQUEST
    ) {
        this.logger.log('QueuePingQueueProcessor initialized');
        // this.logger.log(this.portalService.getHook)
    }

    @Process(JobNames.DOCUMENT_GENERATE)
    async handle(job: Job<DocumentGenerateDto>) {
        const dto = job.data;
        const socketId = dto.socketId;
        this.logger.log('QUEUE PING HANDLE');
        this.logger.log(dto.domain);

        this.logger.log(dto.socketId);
        const result = await this.useCase.generateDocumentAndPushToBx(dto);
        try {
            if (socketId) {
                this.ws.sendToClient(socketId, {
                    event: 'document-generate:done',
                    data: {
                        ...result,
                        result: {
                            success: true,
                            message: 'Document generated successfully',
                        },
                    },
                });
            }
            await this.telegramService.sendMessage(
                'ALFA DOCUMENT GENERATE Queue: Document generated and sent to ws client successfully',
            );
        } catch (error) {
            this.logger.error(error);
            await this.telegramService.sendMessage(
                "ALFA DOCUMENT GENERATE Queue: Can't send message to ws client" +
                    dto.domain +
                    '' +
                    dto.dealId,
            );
        }
    }
}
