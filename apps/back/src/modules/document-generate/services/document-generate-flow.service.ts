import { DocumentGenerateDto } from '../dto/document-generate.dto';
import { PBXService } from '@/modules/pbx/';
import { BitrixOwnerTypeId } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { DocumentContractFieldsService } from './document-contract-fields.service';
import {
    currentDocumentFields,
    EContractType,
    EnumDealCurrentDocumentFieldCode,
} from '@alfa/entities';

import { PpkApplicationGenerateService } from './ppk-application-generate.service';
import { TelegramService } from '@/modules/telegram/telegram.service';
import { BxTimelineService } from '../../flow/timeline-flow/bx-timeline.service';
import { BxBatchDocumentSendService } from './bx-document-send.service';
import { DocumentGenerateDocService } from './document-generate-doc.service';
import { DocumentGeneratePdfService } from './document-generate-pdf.service';
import { StorageService } from '@/core/storage';
import { IBitrixBatchResponseResult } from '@/modules/bitrix/core/interface/bitrix-api.intterface';
import { BxDealStageFlowService } from '@/modules/flow/bitrix-deal-flow/bx-deal-stage-flow.service';
import { EmailDocumentFlowService } from '@/modules/flow/email-flow/email-document-flow.service';
import { BxDealContactFlowService } from '@/modules/flow/bitrix-deal-flow/bx-deal-contact-flow.service';
import { IRequestDocumentGenerateResponse } from '../type/request-document-generate.type';
import { BitrixService } from '@/modules/bitrix';
import { BxDiskFlowService } from '@/modules/flow/disk-flow/bx-disk-flow.service';
import { delay } from '@/lib';

export class DocumentGenerateFlowService {
    private bitrix: BitrixService;
    private dealId: number;
    private filesForSend: [string, string][] = [];
    private userId: number;
    private companyName: string = 'Компания без названия';
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
        this.companyName = dto.companyName || 'Компания без названия';
        this.bitrix = bitrix;
        const dealId = Number(dto.dealId);
        this.dealId = dealId;
        const dealService = new BxDealStageFlowService(bitrix, dealId);
        const contactService = new BxDealContactFlowService(bitrix, dealId);
        const bxDiskFlowService = new BxDiskFlowService(bitrix, dealId);
        // this.bitrix = bitrix;
        this.userId = dto.userId;

        const contactResult = await contactService.flow({
            email: dto.email.email || '',
            name: dto.email.name || '',
            phone: dto.email.phone || '',
            userId: dto.userId,
        });
        const contactId = contactResult.contactId;

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
        await delay(1000)
        //обновление стадии сделки
        void (await dealService.changeStageFromDocument());

        //test upload files to bitrix disk
        const { folderUrl } = await bxDiskFlowService.upload(this.filesForSend);

        if (folderUrl) {
            await delay(500)
            await this.bxTimelineService.setTimelineDocumentPin(folderUrl);

        }



        let mailResult: any = null;
        if (dto.email.needEmail && dto.email.email) {
            await delay(1000)
            const emailDocumentFlowService = new EmailDocumentFlowService(
                bitrix,
                this.bxTimelineService,
                Number(dealId),
            );
            const emailDocumentFlowResult = await emailDocumentFlowService.flow(
                {
                    filesForSend: this.filesForSend,
                    email: dto.email.email,
                    name: dto.email.name || '',
                    phone: dto.email.phone || '',
                    documentPrefixNumber: dto.documentPrefixNumber,
                    userName: dto.userName || '',
                    userId: dto.userId.toString(),
                    companyName: dto.companyName || '',
                    contactId: contactId,
                    edoComment: dto.edoComment || '',
                    needEdoEmail: true,
                },
            );
            mailResult = emailDocumentFlowResult;
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
        const updResult = result[
            EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT
        ] as { document: IRequestDocumentGenerateResponse };

        return updResult;
    }

}
