import { Injectable } from '@nestjs/common';
import { DocumentGenerateDto } from '../dto/document-generate.dto';
import { DocumentGenerateService } from '../services/document-generate.service';
import { DocumentGenerateBatchService } from '../services/document-generate-batch.service';

@Injectable()
export class DocumentBitrixGenerateUseCase {
    constructor(
        private readonly documentGenerateService: DocumentGenerateService,
        private readonly documentGenerateBatchService: DocumentGenerateBatchService,
    ) {}

    async generateDocumentAndPushToBx(dto: DocumentGenerateDto) {
        return this.documentGenerateBatchService.generateDocument(dto);
    }
    async generateAndDownloadDocument(dto: DocumentGenerateDto) {
        return this.documentGenerateService.generateDocument(dto);
    }
}
