import { BitrixService } from '@/modules/bitrix';
import { BitrixOwnerTypeId } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import {
    DocumentGenerateFieldTemplateCode,
    EnumDealCurrentDocumentFieldCode,
} from '@alfa/entities';

export class BxBatchDocumentSendService {
    constructor(
        private readonly bitrix: BitrixService,

        private readonly entityId: number,
        private readonly entityTypeId: BitrixOwnerTypeId.DEAL,
    ) {}

    public async add(
        stampsEnabled: 1 | 0,
        values: Record<string, string>,
        templateId: number,
        documentCode: EnumDealCurrentDocumentFieldCode,
    ): Promise<void> {
        const generateDocumentData = {
            templateId: templateId,
            entityId: this.entityId,
            entityTypeId: this.entityTypeId,

            value: 1,
            stampsEnabled,
            values,

            fields: {
                [DocumentGenerateFieldTemplateCode.Paragraph12]: {
                    TYPE: 'string',
                    MULTIPLE: 'Y',
                    SEPARATOR: 3,
                },
            },
        };


        this.bitrix.api.addCmdBatch(
            documentCode,
            'crm.documentgenerator.document.add',
            generateDocumentData,
        );
    }
}
