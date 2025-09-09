import { DocumentGenerateDto } from '../dto/document-generate.dto';
import { PBXService } from '@/modules/pbx/';
import {
    BitrixOwnerTypeId,
} from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { DocumentContractFieldsService } from './document-contract-fields.service';
import {
    currentDocumentFields,
    EContractType,
    EnumDealCurrentDocumentFieldCode,
    IPpkDocumentApplicationData,
} from '@alfa/entities';
import { delay } from '@/lib';
import { PpkApplicationGenerateService } from './ppk-application-generate.service';
import { EmailService } from './email.service';
import { TelegramService } from '@/modules/telegram/telegram.service';
import { BxTimelineService } from './bx-timeline.service';
import { BxBatchDocumentSendService } from './bx-document-send.service';
import { DocumentGenerateDocService } from './document-generate-doc.service';
import { DocumentGeneratePdfService } from './document-generate-pdf.service';
import { StorageService } from '@/core/storage';


export class DocumentGenerateFlowService {
    // private bitrix: BitrixService;
    private filesForSend: [string, string][] = [];
    private userId: number;
    private bxTimelineService: BxTimelineService;
    private bxDocumentSendService: BxBatchDocumentSendService;
    private documentGenerateDocService: DocumentGenerateDocService;
    private documentGeneratePdfService: DocumentGeneratePdfService;
    private ppkApplicationGenerateService: PpkApplicationGenerateService;
    constructor(
        private readonly storageService: StorageService,
        private readonly pbxService: PBXService,
        private readonly documentContractFieldsService: DocumentContractFieldsService,
        private readonly tgBot: TelegramService

    ) { }

    async generateDocument(dto: DocumentGenerateDto) {
        const { bitrix } = await this.pbxService.init('alfacentr.bitrix24.ru');
        // this.bitrix = bitrix;
        this.userId = dto.userId;
        const entityId = Number(dto.dealId);
        this.bxTimelineService = new BxTimelineService(bitrix, this.userId, entityId);
        this.bxDocumentSendService = new BxBatchDocumentSendService(bitrix, entityId, BitrixOwnerTypeId.DEAL);
        this.documentGenerateDocService = new DocumentGenerateDocService(this.bxDocumentSendService);
        this.documentGeneratePdfService = new DocumentGeneratePdfService(bitrix, this.bxTimelineService, this.filesForSend, this.tgBot);
        this.ppkApplicationGenerateService = new PpkApplicationGenerateService(this.storageService, this.bxTimelineService, bitrix, this.filesForSend);

        const contractTemplateContentData =
            this.documentContractFieldsService.getContractFields(
                dto.contractType,
                dto.header,
                // dto.paragraph,
                dto.paragraphItems || [],
                dto.totalSum,
                dto.client,
                dto.clientSignature,
                dto.documentPrefixNumber,
                dto.documentCounter,
                dto.email.email,
                dto.seminarParticipantsCount,


            );
        void await this.documentGenerateDocService.generateDocumentsBtch(dto, contractTemplateContentData.templateId, contractTemplateContentData.fields);

        const currentPpkApplicationBitrixId =
            currentDocumentFields[
                EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_DOC
            ].bitrixId;



        const result = await bitrix.api.callBatchWithConcurrency(1);
        void await this.documentGeneratePdfService.pdfGenerate(result, entityId);



        if ((dto.contractType === EContractType.seminar_ppk || dto.contractType === EContractType.ppk) && dto.ppkApplicationData) {
            void await this.ppkApplicationGenerateService.getPpkApplicationFile(entityId, currentPpkApplicationBitrixId, dto.ppkApplicationData as IPpkDocumentApplicationData);

        }


        void await this.bxTimelineService.send('✅ Документы сгенерированы', 'success');


        let mailResult: any = null;
        if (dto.email.needEmail && dto.email.email) {
            await delay(500);
            void await this.bxTimelineService.send('⌛ Отправка email...', 'email');


            const emailService = new EmailService(
                bitrix,
                this.filesForSend,
                dto.email.email,
                dto.email.name || '',
                dto.documentPrefixNumber,
                '',
                dto.dealId
            );
            mailResult = await emailService.send();


        } else {
            void await this.bxTimelineService.send('📄 Email не будет отправлен. Только формирование документов', 'email');

        }

        return { result, filesCount: this.filesForSend.length, files: this.filesForSend, mailResult };

    }


}
