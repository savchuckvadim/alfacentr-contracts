import { Injectable } from "@nestjs/common";
import { DocumentBitrixGenerateUseCase } from "../use-cases/document-bitrix-generate.use-case";
import { DocumentGenerateDto } from "../dto/document-generate.dto";
import { PBXService } from "@/modules/pbx/";
import { BitrixOwnerTypeId } from "@/modules/bitrix/domain/enums/bitrix-constants.enum";
import { DocumentContractFieldsService } from "./document-contract-fields.service";

@Injectable()
export class DocumentGenerateService {
    constructor(
        private readonly pbxService: PBXService,
        private readonly documentContractFieldsService: DocumentContractFieldsService
    ) { }

    async generateDocument(dto: DocumentGenerateDto) {
        const { bitrix } = await this.pbxService.init('alfacentr.bitrix24.ru')
        const entityId = Number(dto.dealId)

        const contractTemplateContentData = this.documentContractFieldsService.getContractFields(
            dto.contractType,
            dto.header,
            dto.paragraph,
            dto.totalSum,
            dto.client
        )
        const generateDocumentData = {
            templateId: contractTemplateContentData.templateId,
            entityId: entityId,
            entityTypeId: BitrixOwnerTypeId.DEAL,
            // providerClassName: 'Bitrix\\DocumentGenerator\\DataProvider\\Rest',
            value: 1,
            stampsEnabled: 1,
            values: contractTemplateContentData.fields
        }
        console.log('generateDocumentData')
        console.log(contractTemplateContentData.fields)
        const response = await bitrix.api.call<number>(
            'crm.documentgenerator.document.add',
            generateDocumentData
        )
        return response.result
    }
}   