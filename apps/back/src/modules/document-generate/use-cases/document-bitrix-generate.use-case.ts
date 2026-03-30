import { Injectable } from '@nestjs/common';
import { DocumentGenerateDto } from '../dto/document-generate.dto';

import { PBXService } from '@/modules/pbx';
import { DocumentContractFieldsService } from '../services/document-contract-fields.service';
import { TelegramService } from '@/modules/telegram/telegram.service';
import { StorageService } from '@/core/storage';
import { DocumentGenerateFlowService } from '../services/document-generate-flow.service';

@Injectable()
export class DocumentBitrixGenerateUseCase {
    constructor(
        private readonly storageService: StorageService,
        private readonly pbxService: PBXService,
        private readonly documentContractFieldsService: DocumentContractFieldsService,
        private readonly telegramService: TelegramService,
    ) {}

    async generateDocumentAndPushToBx(dto: DocumentGenerateDto) {
        const documentGenerateBatchService = new DocumentGenerateFlowService(
            this.storageService,
            this.pbxService,
            this.documentContractFieldsService,

            this.telegramService,
        );

        return documentGenerateBatchService.generateDocument(dto);
    }
}
