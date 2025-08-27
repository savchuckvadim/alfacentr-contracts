import { Module } from '@nestjs/common';
import { DocumentGenerateController } from './controllers/document-generate.controller';
import { QueueModule } from '@/modules/queue/queue.module';
import { DocumentBitrixGenerateUseCase } from './use-cases/document-bitrix-generate.use-case';
import { DocumentGenerateService } from './services/document-generate.service';
import { DocumentGenerateQueueProcessor } from './processors/document.processor';
import { PBXModule } from '../pbx';
import { DocumentContractFieldsService } from './services/document-contract-fields.service';
import { PpkApplicationGenerateService } from './services/ppk-application-generate.service';
import { DocumentGenerateBatchService } from './services/document-generate-batch.service';
import { TelegramModule } from '@/modules/telegram';
import { GetDealBidItemsUseCase } from '../on-deal-init/use-cases/get-deal-bid-items.use-case';

@Module({
    imports: [PBXModule, QueueModule, TelegramModule],
    controllers: [DocumentGenerateController],
    providers: [
        DocumentBitrixGenerateUseCase,
        DocumentGenerateService,
        DocumentGenerateQueueProcessor,
        DocumentContractFieldsService,
        PpkApplicationGenerateService,
        // DocumentGenerateBatchService,
        GetDealBidItemsUseCase
    ],
})
export class DocumentGenerateModule {}
