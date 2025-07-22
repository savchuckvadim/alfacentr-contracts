import { Injectable } from '@nestjs/common';
import { DocumentGenerateDto } from '../dto/document-generate.dto';
import { DocumentGenerateService } from '../services/document-generate.service';

@Injectable()
export class DocumentBitrixGenerateUseCase {
    constructor(
        private readonly documentGenerateService: DocumentGenerateService,
    ) {}

    async generateDocumentAndPushToBx(dto: DocumentGenerateDto) {
        return this.documentGenerateService.generateDocument(dto);
    }
    async generateAndDownloadDocument(dto: DocumentGenerateDto) {
        return this.documentGenerateService.generateDocument(dto);
    }
}
