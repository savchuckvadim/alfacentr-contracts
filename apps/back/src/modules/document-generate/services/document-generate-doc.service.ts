import { DocumentGenerateDto } from '../dto/document-generate.dto';

import {
    DocumentGenerateFieldTemplateCode,
    DocumentGenerateTemplatesType,
    EnumDealCurrentDocumentFieldCode,
    RQ_TYPE,
} from '@alfa/entities';

import { BxBatchDocumentSendService } from './bx-document-send.service';

export class DocumentGenerateDocService {
    constructor(
        private readonly bxDocumentSendService: BxBatchDocumentSendService,
    ) { }

    async generateDocumentsBtch(
        dto: DocumentGenerateDto,
        templateId: number,
        fields: Record<string, string | string[]>,
        ownBankFields: Record<string, string | string[]>,
    ): Promise<void> {
        void (await this.bxDocumentSendService.add(
            0,
            { ...fields, ...ownBankFields } as Record<string, string>,
            Number(templateId),
            EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT,
        ));

        await this.getActFile({
            fields: {
                ...ownBankFields,
                UfCrm8ShotReqClient: dto.clientShortRq,
                ShortClientRq: dto.clientShortRq,
                // убираем кастомный нумератор, чтобы использовать битриксовский
                // DocumentNumber: dto.documentCounter,
                // TITLE: dto.documentPrefixNumber,
                // DocumentTitle: `УПД №${dto.documentCounter} к Договору №${dto.documentPrefixNumber}`,
                DocumentPrefixNumber: dto.documentPrefixNumber,
                DocumentNumberCounter: dto.documentCounter,
                DocumentCompanyTitle: dto.clientCompanyTitle,
                DocumentDirectorInitials: dto.clientDirectorInitials,
                [DocumentGenerateFieldTemplateCode.ACT_DATE]: dto.actDate,
                [DocumentGenerateFieldTemplateCode.CLIENT_SHORT_NAME]:
                    dto.clientCompanyShortTitle,
                [DocumentGenerateFieldTemplateCode.CLIENT_UPD_ADDRESS]:
                    dto.clientUpdAddress,
                [DocumentGenerateFieldTemplateCode.CLIENT_UPD_INN_KPP]:
                    dto.clientUpdInnKpp,
            } as Record<string, string>,
        });

        // const currentPpkApplicationBitrixId =
        //     currentDocumentFields[
        //         EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_DOC
        //     ].bitrixId;
        const invoiceNumber = dto.documentCounter || '1';
        await this.getInvoicesFiles(dto.clientType, {
            fields: {
                ...ownBankFields,
                ShortClientRq: dto.clientShortRq,
                UfCrm8ShotReqClient: dto.clientShortRq,
                DocumentPrefixNumber: dto.documentPrefixNumber, //номер договора с префиксом для упоминания догвора
                DocumentNumberCounter: invoiceNumber,
                // DocumentTitle: `Счет №${dto.documentCounter} к Договору №${dto.documentPrefixNumber}`,
                DocumentTitle: `Счет №${invoiceNumber}`,
            } as Record<string, string>,
        });
        // const result = await this.bitrix.api.callBatchWithConcurrency(1);

        // void await this.bxTimelineService.send('⌛ Ожидание генерации PDF ...', 'waiting');
    }

    private async getActFile(contractTemplateContentData: {
        fields: Record<string, string>;
    }): Promise<void> {
        const templateWithoutStampsId = DocumentGenerateTemplatesType.ACT.id;

        void (await this.bxDocumentSendService.add(
            0,
            contractTemplateContentData.fields,
            Number(templateWithoutStampsId),

            EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT,
        ));
    }

    private async getInvoicesFiles(
        clientType: RQ_TYPE,
        contractTemplateContentData: { fields: Record<string, string> },
    ) {
        const templateWithoutStampsId =
            clientType === RQ_TYPE.FIZ
                ? DocumentGenerateTemplatesType.INVOISE_QR_WITHOUT_STAMPS.id
                : DocumentGenerateTemplatesType.INVOISE_WITHOUT_STAMPS.id;

        const templateWithStampsId =
            clientType === RQ_TYPE.FIZ
                ? DocumentGenerateTemplatesType.INVOISE_QR_WITH_STAMPS.id
                : DocumentGenerateTemplatesType.INVOISE_WITH_STAMPS.id;

        void (await this.bxDocumentSendService.add(
            1,
            contractTemplateContentData.fields,
            Number(templateWithStampsId),

            EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT,
        ));

        void (await this.bxDocumentSendService.add(
            0,
            contractTemplateContentData.fields,
            Number(templateWithoutStampsId),

            EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT,
        ));
    }
}
