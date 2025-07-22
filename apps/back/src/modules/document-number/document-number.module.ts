import { Module } from '@nestjs/common';
import { PBXModule } from '../pbx/pbx.module';
import { DocumentNumberController } from './controller/document-number.controller';
import { QueueModule } from '../queue/queue.module';
import { DocumentNumberByPrefixUseCase } from './use-cases/document-number-by-prefix.use-case';
import { DocumentNumberByPrefixQueueProcessor } from './processors/document-number-by-prefix.processor';
import { DocumentNumberUseCase } from './use-cases/document-number.use-case';
import { DocumentNumberQueueProcessor } from './processors/document-number.processor';
import { WsEventsModule } from '@/core/ws';

@Module({
    imports: [PBXModule, QueueModule, WsEventsModule],
    controllers: [DocumentNumberController],
    providers: [
        DocumentNumberByPrefixUseCase,
        DocumentNumberByPrefixQueueProcessor,
        DocumentNumberUseCase,
        DocumentNumberQueueProcessor,
    ],
})
export class DocumentNumberModule {}
