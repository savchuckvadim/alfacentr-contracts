import { Module } from '@nestjs/common';
import { PBXModule } from '../pbx/pbx.module';
import { DocumentNumberController } from './controller/document-number.controller';
import { QueueModule } from '../queue/queue.module';
import { DocumentNumberByPrefixUseCase } from './use-cases/document-number-by-prefix.use-case';
import { DocumentNumberByPrefixQueueProcessor } from './processors/document-number-by-prefix.processor';
import { DocumentNumberUseCase } from './use-cases/document-number.use-case';
import { DocumentNumberQueueProcessor } from './processors/document-number.processor';
import { DocumentCounterService } from './services/document-counter.service';
import { HealCounterDuplicateUseCase } from './use-cases/heal-counter-duplicate.use-case';
import { WsEventsModule } from '@/core/ws';
import { RedisModule } from '@/core/redis/redis.module';

@Module({
    imports: [PBXModule, QueueModule, WsEventsModule, RedisModule],
    controllers: [DocumentNumberController],
    providers: [
        DocumentCounterService,
        DocumentNumberByPrefixUseCase,
        DocumentNumberByPrefixQueueProcessor,
        HealCounterDuplicateUseCase,
        DocumentNumberUseCase,
        DocumentNumberQueueProcessor,
    ],
})
export class DocumentNumberModule {}
