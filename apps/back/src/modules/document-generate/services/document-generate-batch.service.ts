import { Injectable } from '@nestjs/common';
import { DocumentGenerateDto } from '../dto/document-generate.dto';
import { PBXService } from '@/modules/pbx/';
import { BitrixActivityTypeId, BitrixOwnerTypeId } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { DocumentContractFieldsService } from './document-contract-fields.service';
import { currentDocumentFields, documentFields, DocumentGenerateTemplatesType, EnumDealCurrentDocumentFieldCode } from '@alfa/entities';
import { IRequestDocumentGenerateResponse } from '../type/request-document-generate.type';
import { delay } from '@/lib';
import { BitrixService, IBXTimelineComment } from '@/modules/bitrix/';
import { PpkApplicationGenerateService } from './ppk-application-generate.service';

@Injectable()
export class DocumentGenerateBatchService {
    private bitrix: BitrixService
    constructor(
        private readonly pbxService: PBXService,
        private readonly documentContractFieldsService: DocumentContractFieldsService,
        private readonly ppkApplicationGenerateService: PpkApplicationGenerateService,
    ) { }

    async generateDocument(dto: DocumentGenerateDto) {
        const { bitrix } = await this.pbxService.init('alfacentr.bitrix24.ru');
        this.bitrix = bitrix
        const entityId = Number(dto.dealId);

        const contractTemplateContentData =
            this.documentContractFieldsService.getContractFields(
                dto.contractType,
                dto.header,
                dto.paragraph,
                dto.totalSum,
                dto.client,
            );
        // const generateDocumentData = {
        //     templateId: contractTemplateContentData.templateId,
        //     entityId: entityId,
        //     entityTypeId: BitrixOwnerTypeId.DEAL,
        //     // providerClassName: 'Bitrix\\DocumentGenerator\\DataProvider\\Rest',
        //     value: 1,
        //     stampsEnabled: 1,
        //     values: contractTemplateContentData.fields,
        // };

        // const response = await bitrix.api.call<number>(
        //     'crm.documentgenerator.document.add',
        //     generateDocumentData,
        // );
        // const resultContract = await this.addDocumentToDeal(
        //     entityId,
        //     1,
        //     contractTemplateContentData.fields as Record<string, string>,
        //     Number(contractTemplateContentData.templateId),
        //     BitrixOwnerTypeId.DEAL
        // )
        const resultContractWithoutPt = await this.addDocumentToDeal(
            entityId,
            0,
            contractTemplateContentData.fields as Record<string, string>,
            Number(contractTemplateContentData.templateId),
            BitrixOwnerTypeId.DEAL,
            EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT
        )
        const resultContractWithPt = await this.addDocumentToDeal(
            entityId,
            1,
            contractTemplateContentData.fields as Record<string, string>,
            Number(contractTemplateContentData.templateId),
            BitrixOwnerTypeId.DEAL,
            EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITH_PT
        )
        // const file = await bitrix.file.downloadBitrixFileAndConvertToBase64(resultContractWithoutPt.downloadUrlMachine)

        const currentContractBitrixId = currentDocumentFields[EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITH_PT].bitrixId
        const currentContractWithoutPtBitrixId = currentDocumentFields[EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT].bitrixId
        const currentInvoicesBitrixId = currentDocumentFields[EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT].bitrixId
        const currentInvoicesWithoutPtBitrixId = currentDocumentFields[EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT].bitrixId
        const currentActBitrixId = currentDocumentFields[EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT].bitrixId
        const actDocWithoutPtFileData = await this.getActFile(entityId, {
            fields: {
                UfCrm8ShotReqClient: dto.clientShortRq,
                DocumentFullNumber: '123',
            } as Record<string, string>,
        })


        const currentPpkApplicationBitrixId = currentDocumentFields[EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_DOC].bitrixId

        // const contractPdf = await this.expectPdfFile(resultContract.id)
        // const pdfContractFileData = await this.getPdfFileData(contractPdf)
        // const { invoiceDocWithoutPtFileData, pdfInvoiceFileData } =
        await this.getInvoicesFiles(entityId, {
            fields: {
                ShortClientRq: dto.clientShortRq,
                DocumentFullNumber: 'dto.contractNumber',
            } as Record<string, string>,

        })
        const result = await this.bitrix.api.callBatchWithConcurrency()
        // console.log(result)

        result.forEach(async item => {
            const documentResults = item.result as {
                [EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT]: {
                    document: IRequestDocumentGenerateResponse
                },
                [EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT]: {
                    document: IRequestDocumentGenerateResponse
                },
                [EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITH_PT]: {
                    document: IRequestDocumentGenerateResponse
                },
                [EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT]: {
                    document: IRequestDocumentGenerateResponse
                },
                [EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT]: {
                    document: IRequestDocumentGenerateResponse
                },


            }
            console.log('documentResults', documentResults)
            const dealFields = {
                [`${currentContractBitrixId}`]: {
                    // @ts-ignore
                    fileData: null as [string, string] | null
                },
                [`${currentContractWithoutPtBitrixId}`]: {
                    // @ts-ignore
                    fileData: null as [string, string] | null
                },
                [`${currentInvoicesBitrixId}`]: {
                    // @ts-ignore
                    fileData: null as [string, string] | null

                },
                [`${currentInvoicesWithoutPtBitrixId}`]: {
                    // @ts-ignore
                    fileData: null as [string, string] | null

                },
                [`${currentActBitrixId}`]: {
                    // @ts-ignore
                    fileData: null as [string, string] | null

                }

            }
            for (const key in documentResults) {

                const document = documentResults[key].document
                switch (key) {
                    case EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT:
                        console.log('CURRENT_ACT_WITH_PT', document.downloadUrl)

                        const actDocumentFileData = await this.bitrix.file.downloadBitrixFileAndConvertToBase64(document.downloadUrlMachine)
                        dealFields[`${currentActBitrixId}`].fileData = actDocumentFileData
                        break
                    case EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT:
                        console.log('CURRENT_INVOICES_WITH_PT', document.downloadUrl)
                        const invoicePdf = await this.expectPdfFile(document.id)
                        const pdfInvoiceFileData = await this.getPdfFileData(invoicePdf)
                        dealFields[`${currentInvoicesBitrixId}`].fileData = pdfInvoiceFileData
                        break
                    case EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT:
                        console.log('CURRENT_INVOICES_WITHOUT_PT', document.downloadUrl)

                        const invoiceDocWithoutPtFileData = await this.bitrix.file.downloadBitrixFileAndConvertToBase64(document.downloadUrlMachine)
                        dealFields[`${currentInvoicesWithoutPtBitrixId}`].fileData = invoiceDocWithoutPtFileData
                        break
                    case EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT:
                        console.log('CURRENT_CONTRACT_WITHOUT_PT', document.downloadUrl)
                        const contractDocWithoutPtFileData = await this.bitrix.file.downloadBitrixFileAndConvertToBase64(document.downloadUrlMachine)
                        dealFields[`${currentContractWithoutPtBitrixId}`].fileData = contractDocWithoutPtFileData
                    case EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITH_PT:
                        console.log('CURRENT_CONTRACT_WITH_PT', document.downloadUrl)

                        const contractPdf = await this.expectPdfFile(document.id)
                        const contractPdfFileData = await this.getPdfFileData(contractPdf)
                        dealFields[`${currentContractBitrixId}`].fileData = contractPdfFileData
                        break
                }
            }

            const updateDealDocumentsResponse = await this.bitrix.deal.update(
                entityId,
                // @ts-ignore
                dealFields
            )

        })
        const ppkApplicationFileData = await this.ppkApplicationGenerateService.generateDocxBase64(
            {
                client: dto.client,
                contract: dto.contractType,
                deal: dto.dealId,
            }
        )
        const updateDealPpkApplicationResponse = await bitrix.deal.update(
            entityId,
            {
                [`${currentPpkApplicationBitrixId}`]: {
                    // @ts-ignore
                    fileData: ppkApplicationFileData
                }
            }
        )
        const timelieneData: IBXTimelineComment = {
            AUTHOR_ID: '502',
            COMMENT: '✅ Документы сгенерированы',
            ENTITY_TYPE: 'deal',
            ENTITY_ID: entityId,

        }
        await this.bitrix.timeline.addTimelineComment(
            timelieneData
        )
        await delay(500)

        const activityResponse = await this.bitrix.activity.createActivity({
            OWNER_TYPE_ID: BitrixOwnerTypeId.DEAL,
            OWNER_ID: entityId,
            TYPE_ID: BitrixActivityTypeId.EMAIL,
            DIRECTION: 2, // 1 - incoming, 2 - outgoing
            RESPONSIBLE_ID: '502',

            SETTINGS: {
                'MESSAGE_FROM': `Иванов Иван <laravelsamvel@gmail.com>`
            },
            SUBJECT: '✅ Документы сгенерированы',
            DESCRIPTION: '<h2>Документы сгенерированы</h2>',
            COMPLETED: "Y",
            DESCRIPTION_TYPE: 2,
            START_TIME: new Date().toISOString(),
            END_TIME: new Date(Date.now() + 3600 * 1000).toISOString(),
            COMMUNICATIONS: [
                {
                    ENTITY_ID: entityId,
                    ENTITY_TYPE_ID: BitrixOwnerTypeId.DEAL,
                    TYPE_ID: 1,
                    VALUE: 'laravelsamvel@gmail.com',


                }
            ],

        })
        console.log('activityResponse', activityResponse)
        return result
        // const updateDealDocumentsResponse = await bitrix.deal.update(
        //     entityId,
        //     {
        //         // [`${currentContractBitrixId}`]: {
        //         //     // @ts-ignore
        //         //     fileData: pdfContractFileData
        //         // },
        //         [`${currentContractWithoutPtBitrixId}`]: {
        //             // @ts-ignore
        //             fileData: file
        //         },
        //         [`${currentInvoicesBitrixId}`]: {
        //             // @ts-ignore
        //             fileData: pdfInvoiceFileData
        //         },
        //         [`${currentInvoicesWithoutPtBitrixId}`]: {
        //             // @ts-ignore
        //             fileData: invoiceDocWithoutPtFileData
        //         },
        //         [`${currentActBitrixId}`]: {
        //             // @ts-ignore
        //             fileData: actDocWithoutPtFileData
        //         },
        //     }
        // )


        // const ppkApplicationFileData = await this.ppkApplicationGenerateService.generateDocxBase64(
        //     {
        //         client: dto.client,
        //         contract: dto.contractType,
        //         deal: dto.dealId,
        //     }
        // )
        // const updateDealPpkApplicationResponse = await bitrix.deal.update(
        //     entityId,
        //     {
        //         [`${currentPpkApplicationBitrixId}`]: {
        //             // @ts-ignore
        //             fileData: ppkApplicationFileData
        //         }
        //     }
        // )
        // return {
        //     // contractPdf,
        //     // contractWithoutPtPdf: resultContract,
        //     updateDealDocumentsResponse,

        //     updateDealPpkApplicationResponse
        //     // invoicesPdf,
        //     // invoicesWithoutPtPdf
        // };
    }

    private async getActFile(
        entityId: number,
        contractTemplateContentData: { fields: Record<string, string> },

    ): Promise<void> {
        const templateWithoutStampsId = DocumentGenerateTemplatesType.ACT.id



        const resultAct = await this.addDocumentToDeal(
            entityId,
            0,
            contractTemplateContentData.fields as Record<string, string>,
            Number(templateWithoutStampsId),
            BitrixOwnerTypeId.DEAL,
            EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT
        )


        // const actDocWithoutPtFileData = await this.bitrix.file.downloadBitrixFileAndConvertToBase64(resultAct.downloadUrlMachine)

        // return actDocWithoutPtFileData
    }

    private async getInvoicesFiles(
        entityId: number,
        contractTemplateContentData: { fields: Record<string, string> },

    ) {
        const templateWithoutStampsId = DocumentGenerateTemplatesType.INVOISE_WITHOUT_STAMPS.id
        const templateWithStampsId = DocumentGenerateTemplatesType.INVOISE_WITH_STAMPS.id

        const resultInvoice = await this.addDocumentToDeal(
            entityId,
            1,
            contractTemplateContentData.fields as Record<string, string>,
            Number(templateWithStampsId),
            BitrixOwnerTypeId.DEAL,
            EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT
        )

        const resultInvoiceWithoutPt = await this.addDocumentToDeal(
            entityId,
            0,
            contractTemplateContentData.fields as Record<string, string>,
            Number(templateWithoutStampsId),
            BitrixOwnerTypeId.DEAL,
            EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT
        )

        // const invoicePdf = await this.expectPdfFile(resultInvoice.id)
        // const pdfInvoiceFileData = await this.getPdfFileData(invoicePdf)
        // const invoiceDocWithoutPtFileData = await this.bitrix.file.downloadBitrixFileAndConvertToBase64(resultInvoiceWithoutPt.downloadUrlMachine)

        // return {

        //     invoiceDocWithoutPtFileData,
        //     pdfInvoiceFileData,
        // }
    }
    private async getPdfFileData(document: IRequestDocumentGenerateResponse): Promise<[string, string]> {
        const file = await this.bitrix.file.downloadBitrixFileAndConvertToBase64(document.pdfUrlMachine)
        return file
    }
    private async expectPdfFile(fileId: number) {
        console.log('expectPdfFile');
        console.log(fileId);

        let count = 0
        let result: IRequestDocumentGenerateResponse | null = null
        while (!result) {
            const readonly = await this.bitrix.api.call<number>(
                'crm.documentgenerator.document.get',
                {
                    id: fileId,
                },
            );
            const document = readonly.result.document as IRequestDocumentGenerateResponse
            console.log('document');
            console.log(document);


            count++
            await delay(10000)
            if (document.pdfUrlMachine) {
                result = document

            }

        }
        return result
    }

    private async addDocumentToDeal(
        entityId: number,
        stampsEnabled: 1 | 0,
        values: Record<string, string>,
        templateId: number,
        entityTypeId: BitrixOwnerTypeId,
        documentCode: EnumDealCurrentDocumentFieldCode
    ): Promise<void> {

        const generateDocumentData = {
            templateId: templateId,
            entityId: entityId,
            entityTypeId: entityTypeId,
            // providerClassName: 'Bitrix\\DocumentGenerator\\DataProvider\\Rest',
            value: 1,
            stampsEnabled,
            values,
        };

        this.bitrix.api.addCmdBatch(
            documentCode,
            'crm.documentgenerator.document.add',
            generateDocumentData

        )

        // const response = await bitrix.api.call<number>(
        //     'crm.documentgenerator.document.add',
        //     generateDocumentData,
        // );
        // return response.result.document as IRequestDocumentGenerateResponse

    }

    private async addDocumentToDealSimple(
        entityId: number,
        stampsEnabled: 1 | 0,
        values: Record<string, string>,
        templateId: number,
        entityTypeId: BitrixOwnerTypeId
    ) {
        const bitrix = this.bitrix;
        const generateDocumentData = {
            templateId: templateId,
            entityId: entityId,
            entityTypeId: entityTypeId,
            // providerClassName: 'Bitrix\\DocumentGenerator\\DataProvider\\Rest',
            value: 1,
            stampsEnabled,
            values,
        };

        const response = await bitrix.api.call<number>(
            'crm.documentgenerator.document.add',
            generateDocumentData,
        );
        return response.result.document as IRequestDocumentGenerateResponse
    }
}
