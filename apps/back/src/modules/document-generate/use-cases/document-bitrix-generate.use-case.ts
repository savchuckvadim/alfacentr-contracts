import { Injectable } from '@nestjs/common';
import { DocumentGenerateDto } from '../dto/document-generate.dto';
import { DocumentGenerateService } from '../services/document-generate.service';
import { DocumentGenerateBatchService } from '../services/document-generate-batch.service';
import { PBXService } from '@/modules/pbx';
import { DocumentContractFieldsService } from '../services/document-contract-fields.service';
import { PpkApplicationGenerateService } from '../services/ppk-application-generate.service';

@Injectable()
export class DocumentBitrixGenerateUseCase {
    constructor(
        private readonly documentGenerateService: DocumentGenerateService,
        // private readonly documentGenerateBatchService: DocumentGenerateBatchService,
        private readonly pbxService: PBXService,
        private readonly documentContractFieldsService: DocumentContractFieldsService,
        private readonly ppkApplicationGenerateService: PpkApplicationGenerateService,
    ) {}

    async generateDocumentAndPushToBx(dto: DocumentGenerateDto) {
        const documentGenerateBatchService = new DocumentGenerateBatchService(
            this.pbxService,
            this.documentContractFieldsService,
            this.ppkApplicationGenerateService,
        );

        return documentGenerateBatchService.generateDocument(dto);
    }
    async generateAndDownloadDocument(dto: DocumentGenerateDto) {
        return this.documentGenerateService.generateDocument(dto);
    }
}
