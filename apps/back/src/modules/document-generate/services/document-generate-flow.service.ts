import { DocumentGenerateDto } from '../dto/document-generate.dto';
import { PBXService } from '@/modules/pbx/';
import { BitrixOwnerTypeId } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
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
import { IBitrixBatchResponseResult } from '@/modules/bitrix/core/interface/bitrix-api.intterface';
import { IBXContact } from '@/modules/bitrix';

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
        private readonly tgBot: TelegramService,
    ) { }

    async generateDocument(dto: DocumentGenerateDto) {
        const { bitrix } = await this.pbxService.init('alfacentr.bitrix24.ru');
        // this.bitrix = bitrix;
        this.userId = dto.userId;
        const contactResponse = await bitrix.contact.getList({
            'EMAIL': dto.email.email || '',
        });


        console.log('CONTACT');
        console.log('CONTACT', contactResponse);
        const contact = (contactResponse.result?.[0] || null) as IBXContact | null;
        let contactId = null as number | null;

        if (!contact) {
            const contactAddResponse = await bitrix.contact.set({
                RESPONSIBLE_ID: this.userId,
                NAME: dto.email.name || '',
                EMAIL: [{ VALUE: dto.email.email || '', TYPE: 'WORK' }],
                PHONE: [{ VALUE: dto.email.phone || '', TYPE: 'WORK' }],
                DEAL_ID: dto.dealId,
            });
            const createdContactId = contactAddResponse.result;

            contactId = Number(createdContactId);
        } else {
            contactId = Number((contact as IBXContact).ID) as number;
        }
        const dealContacts = await bitrix.deal.contactItemsGet(dto.dealId);
        const dealHasContact = dealContacts.result.some((contact) => contact.CONTACT_ID === contactId);
        console.log('dealHasContact', dealHasContact);
        console.log('contactId', contactId);
        console.log('dealContacts', dealContacts.result);
        // if (!dealHasContact) {
            const dealContactResponse = await bitrix.deal.contactItemsSet(dto.dealId, [contactId]);
            console.log('dealContactResponse', dealContactResponse);
        // }

        const entityId = Number(dto.dealId);
        this.bxTimelineService = new BxTimelineService(
            bitrix,
            this.userId,
            entityId,
        );

        this.bxDocumentSendService = new BxBatchDocumentSendService(
            bitrix,
            entityId,
            BitrixOwnerTypeId.DEAL,
        );
        this.documentGenerateDocService = new DocumentGenerateDocService(
            this.bxDocumentSendService,
        );
        this.documentGeneratePdfService = new DocumentGeneratePdfService(
            bitrix,
            this.bxTimelineService,
            this.filesForSend,
            this.tgBot,
        );
        this.ppkApplicationGenerateService = new PpkApplicationGenerateService(
            this.storageService,
            this.bxTimelineService,
            bitrix,
            this.filesForSend,
        );


        const contractTemplateContentData =
            this.documentContractFieldsService.getContractFields(
                dto.clientType,
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
        void (await this.documentGenerateDocService.generateDocumentsBtch(
            dto,
            contractTemplateContentData.templateId,
            contractTemplateContentData.fields,
        ));

        const currentPpkApplicationBitrixId =
            currentDocumentFields[
                EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_DOC
            ].bitrixId;

        const result = await bitrix.api.callBatchWithConcurrency(1);
        this.prepareResult(result);
        void (await this.documentGeneratePdfService.pdfGenerate(
            result,
            entityId,
        ));

        if (
            (dto.contractType === EContractType.seminar_ppk ||
                dto.contractType === EContractType.ppk) &&
            dto.ppkApplicationData
        ) {
            void (await this.ppkApplicationGenerateService.getPpkApplicationFile(
                entityId,
                currentPpkApplicationBitrixId,
                dto.ppkApplicationData,
            ));
        }

        void (await this.bxTimelineService.send(
            '✅ Документы сгенерированы',
            'success',
        ));

        let mailResult: any = null;
        if (dto.email.needEmail && dto.email.email) {
            console.log('NEED EMAIL');
            console.log('dto.email.needEmail', dto.email.needEmail);
            console.log('dto.email.email', dto.email.email);
            console.log('send email');
            await delay(1100);
            void (await this.bxTimelineService.send(
                '⌛ Отправка email...',
                'email',
            ));

            const emailService = new EmailService(
                bitrix,
                this.filesForSend,
                dto.email.email,
                dto.email.name || '',
                dto.email.phone || '',
                dto.documentPrefixNumber,
                '',
                dto.dealId,
                dto.userEmail,
                contactId,
            );
            mailResult = await emailService.send();
        } else {
            void (await this.bxTimelineService.send(
                '📄 Email не будет отправлен. Только формирование документов',
                'email',
            ));
        }

        return {
            result,
            filesCount: this.filesForSend.length,
            files: this.filesForSend,
            mailResult,
        };
    }

    protected prepareResult(results: IBitrixBatchResponseResult[]) {
        const result = results[0].result;
        const updResult =
            result[EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT];
        const updNumber = updResult.document.number;

        return updResult;
    }
}
