import { DocumentGenerateDto } from '../dto/document-generate.dto';
import { PBXService } from '@/modules/pbx/';
import {
    BitrixActivityTypeId,
    BitrixOwnerTypeId,
} from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { DocumentContractFieldsService } from './document-contract-fields.service';
import {
    currentDocumentFields,
    DocumentGenerateFieldTemplateCode,
    DocumentGenerateTemplatesType,
    EContractType,
    EnumDealCurrentDocumentFieldCode,
    RQ_TYPE,
} from '@alfa/entities';
import { IRequestDocumentGenerateResponse } from '../type/request-document-generate.type';
import { delay } from '@/lib';
import { BitrixService, IBXTimelineComment } from '@/modules/bitrix/';
import { PpkApplicationGenerateService } from './ppk-application-generate.service';
import { EmailService } from './email.service';
import { TelegramService } from '@/modules/telegram/telegram.service';


export class DocumentGenerateBatchService {
    private bitrix: BitrixService;
    private filesForSend: [string, string][] = [];
    constructor(
        private readonly pbxService: PBXService,
        private readonly documentContractFieldsService: DocumentContractFieldsService,
        private readonly ppkApplicationGenerateService: PpkApplicationGenerateService,
        private readonly tgBot: TelegramService

    ) { }

    async generateDocument(dto: DocumentGenerateDto) {
        const { bitrix } = await this.pbxService.init('alfacentr.bitrix24.ru');
        this.bitrix = bitrix;
        const entityId = Number(dto.dealId);

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
            EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT,
        );

        // const resultContractWithPt = await this.addDocumentToDeal(
        //     entityId,
        //     1,
        //     contractTemplateContentData.fields as Record<string, string>,
        //     Number(contractTemplateContentData.templateId),
        //     BitrixOwnerTypeId.DEAL,
        //     EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITH_PT,
        // );

        // const currentContractBitrixId =
        //     currentDocumentFields[
        //         EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITH_PT
        //     ].bitrixId;
        const currentContractWithoutPtBitrixId =
            currentDocumentFields[
                EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT
            ].bitrixId;
        const currentInvoicesBitrixId =
            currentDocumentFields[
                EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT
            ].bitrixId;
        const currentInvoicesWithoutPtBitrixId =
            currentDocumentFields[
                EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT
            ].bitrixId;
        const currentActBitrixId =
            currentDocumentFields[
                EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT
            ].bitrixId;
        const actDocWithoutPtFileData = await this.getActFile(entityId, {
            fields: {
                UfCrm8ShotReqClient: dto.clientShortRq,
                ShortClientRq: dto.clientShortRq,
                DocumentNumber: dto.documentCounter,
                TITLE: dto.documentPrefixNumber,
                DocumentTitle: `Акт оказанных услуг №${dto.documentCounter} к Договору №${dto.documentPrefixNumber}`,
                DocumentPrefixNumber: dto.documentPrefixNumber,
                DocumentNumberCounter: dto.documentCounter,
                DocumentCompanyTitle: dto.clientCompanyTitle,
                DocumentDirectorInitials: dto.clientDirectorInitials,


            } as Record<string, string>,
        });

        const currentPpkApplicationBitrixId =
            currentDocumentFields[
                EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_DOC
            ].bitrixId;

        // const contractPdf = await this.expectPdfFile(resultContract.id)
        // const pdfContractFileData = await this.getPdfFileData(contractPdf)
        // const { invoiceDocWithoutPtFileData, pdfInvoiceFileData } =
        await this.getInvoicesFiles(
            entityId,
            dto.clientType,
            {
                fields: {
                    ShortClientRq: dto.clientShortRq,
                    // DocumentNumber: dto.documentCounter,
                    // TITLE: dto.documentPrefixNumber,
                    // title: `${dto.documentPrefixNumber}`,
                    DocumentPrefixNumber: dto.documentPrefixNumber,
                    DocumentNumberCounter: dto.documentCounter,
                    DocumentTitle: `Счет №${dto.documentCounter} к Договору №${dto.documentPrefixNumber}`,

                } as Record<string, string>,
            });
        const result = await this.bitrix.api.callBatchWithConcurrency(1);



        void await this.sendTimelineComment(entityId, '⌛ Ожидание генерации PDF ...', 'waiting');
        //     AUTHOR_ID: '502',
        // COMMENT: '⌛ Ожидание генерации  PDF ...',
        //     ENTITY_TYPE: 'deal',
        //     ENTITY_ID: entityId,
        // };
        // void await this.bitrix.timeline.addTimelineComment(timelieneDataPdfWaiting);

        for (const item of result) {
            const documentResults = item.result as {
                [EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT]: {
                    document: IRequestDocumentGenerateResponse;
                };
                [EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT]: {
                    document: IRequestDocumentGenerateResponse;
                };
                [EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITH_PT]: {
                    document: IRequestDocumentGenerateResponse;
                };
                [EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT]: {
                    document: IRequestDocumentGenerateResponse;
                };
                [EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT]: {
                    document: IRequestDocumentGenerateResponse;
                };
            };
            console.log('documentResults', documentResults);
            const dealFields = {
                // [`${currentContractBitrixId}`]: {
                //     // @ts-ignore
                //     fileData: null as [string, string] | null,
                // },
                [`${currentContractWithoutPtBitrixId}`]: {
                    // @ts-ignore
                    fileData: null as [string, string] | null,
                },
                [`${currentInvoicesBitrixId}`]: {
                    // @ts-ignore
                    fileData: null as [string, string] | null,
                },
                [`${currentInvoicesWithoutPtBitrixId}`]: {
                    // @ts-ignore
                    fileData: null as [string, string] | null,
                },
                [`${currentActBitrixId}`]: {
                    // @ts-ignore
                    fileData: null as [string, string] | null,
                },
            };




            for (const key in documentResults) {
                const document = documentResults[key].document;
                switch (key) {
                    case EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT:
                        // console.log(
                        //     'CURRENT_ACT_WITH_PT',
                        //     document.downloadUrl,
                        // );

                        const actDocumentFileData =
                            await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
                                document.downloadUrlMachine,
                            );
                        dealFields[`${currentActBitrixId}`].fileData =
                            actDocumentFileData;
                        this.filesForSend.push(actDocumentFileData);
                        break;
                    case EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT:
                        // console.log(
                        //     'CURRENT_INVOICES_WITH_PT',
                        //     document.downloadUrl,
                        // );
                        const invoicePdf = await this.expectPdfFile(
                            document.id,
                        );
                        const pdfInvoiceFileData =
                            await this.getPdfFileData(invoicePdf);
                        dealFields[`${currentInvoicesBitrixId}`].fileData =
                            pdfInvoiceFileData;
                        this.filesForSend.push(pdfInvoiceFileData);
                        break;
                    case EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT:
                        // console.log(
                        //     'CURRENT_INVOICES_WITHOUT_PT',
                        //     document.downloadUrl,
                        // );

                        const invoiceDocWithoutPtFileData =
                            await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
                                document.downloadUrlMachine,
                            );
                        dealFields[
                            `${currentInvoicesWithoutPtBitrixId}`
                        ].fileData = invoiceDocWithoutPtFileData;
                        this.filesForSend.push(invoiceDocWithoutPtFileData);
                        break;
                    case EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT:

                        const contractDocWithoutPtFileData =
                            await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
                                document.downloadUrlMachine,
                            );
                        dealFields[
                            `${currentContractWithoutPtBitrixId}`
                        ].fileData = contractDocWithoutPtFileData;
                        this.filesForSend.push(contractDocWithoutPtFileData);
                    // case EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITH_PT:
                    //     console.log(
                    //         'CURRENT_CONTRACT_WITH_PT',
                    //         document.downloadUrl,
                    //     );

                    //     const contractPdf = await this.expectPdfFile(
                    //         document.id,
                    //     );
                    //     const contractPdfFileData =
                    //         await this.getPdfFileData(contractPdf);
                    //     dealFields[`${currentContractBitrixId}`].fileData =
                    //         contractPdfFileData;
                    //     this.filesForSend.push(contractPdfFileData);
                    //     break;
                }
            }

            const updateDealDocumentsResponse = await this.bitrix.deal.update(
                entityId,
                // @ts-ignore
                dealFields,
            );
        }
        void await this.sendTimelineComment(entityId, '📜 PDF сгенерирован', 'document');
        // const timelieneDataPdfDone: IBXTimelineComment = {
        //     AUTHOR_ID: '502',
        // //     COMMENT: '📜 PDF сгенерирован',
        // //     ENTITY_TYPE: 'deal',
        // //     ENTITY_ID: entityId,
        // };
        // void await this.bitrix.timeline.addTimelineComment(timelieneDataPdfDone);

        if (dto.contractType === EContractType.seminar_ppk || dto.contractType === EContractType.ppk) {
            void await this.getPpkApplicationFile(entityId, currentPpkApplicationBitrixId, dto);
            // const timelieneData: IBXTimelineComment = {
            //     AUTHOR_ID: '502',
            //     COMMENT: '⏳ Ожидание генерации приложения ППК...',
            //     ENTITY_TYPE: 'deal',
            //     ENTITY_ID: entityId,
            // };
            // void await this.bitrix.timeline.addTimelineComment(timelieneData);


            // try {

            //     if (dto.ppkApplicationData) {
            //         const ppkApplicationFileData =
            //             await this.ppkApplicationGenerateService.generateDocxBase64(
            //                 dto.ppkApplicationData
            //                 //     {
            //                 //     client: dto.client,
            //                 //     contract: dto.contractType,
            //                 //     deal: dto.dealId,
            //                 // }
            //             );
            //         const updateDealPpkApplicationResponse = await bitrix.deal.update(
            //             entityId,
            //             {
            //                 [`${currentPpkApplicationBitrixId}`]: {
            //                     // @ts-ignore
            //                     fileData: ppkApplicationFileData,
            //                 },
            //             },
            //         );
            //         this.filesForSend.push(ppkApplicationFileData);

            //         const timelieneData: IBXTimelineComment = {
            //             AUTHOR_ID: '502',
            //             COMMENT: '📜 Приложение ППК сгенерировано',
            //             ENTITY_TYPE: 'deal',
            //             ENTITY_ID: entityId,
            //         };
            //         void await this.bitrix.timeline.addTimelineComment(timelieneData);
            //     } else {
            //         const timelieneData: IBXTimelineComment = {
            //             AUTHOR_ID: '502',
            //             COMMENT: '❌ Произошла ошибка: Приложение ППК не сгенерировано',
            //             ENTITY_TYPE: 'deal',
            //             ENTITY_ID: entityId,
            //         };
            //         void await this.bitrix.timeline.addTimelineComment(timelieneData);
            //     }

            // } catch (error) {
            //     const timelieneData: IBXTimelineComment = {
            //         AUTHOR_ID: '502',
            //         COMMENT: '❌ Произошла ошибка: Приложение ППК не сгенерировано',
            //         ENTITY_TYPE: 'deal',
            //         ENTITY_ID: entityId,
            //     };
            //     void await this.bitrix.timeline.addTimelineComment(timelieneData);

            // }
        }


        void await this.sendTimelineComment(entityId, '✅ Документы сгенерированы', 'success');
        // const timelieneData: IBXTimelineComment = {
        //     AUTHOR_ID: '502',
        //     COMMENT: '✅ Документы сгенерированы',
        // //     ENTITY_TYPE: 'deal',
        // //     ENTITY_ID: entityId,
        // // };
        // void await this.bitrix.timeline.addTimelineComment(timelieneData);

        let mailResult: any = null;
        if (dto.email.needEmail && dto.email.email) {
            await delay(500);
            void await this.sendTimelineComment(entityId, '⌛ Отправка email...', 'email');
            // const timelieneDataEmail: IBXTimelineComment = {
            //     AUTHOR_ID: '502',
            //     COMMENT: '⌛ Отправка email...',
            //     ENTITY_TYPE: 'deal',
            //     ENTITY_ID: entityId,
            // };
            // void await this.bitrix.timeline.addTimelineComment(timelieneDataEmail);

            const emailService = new EmailService(
                this.bitrix,
                this.filesForSend,
                dto.email.email,
                dto.email.name || '',
                dto.documentPrefixNumber,
                '',
                dto.dealId
            );
            mailResult = await emailService.send();


        } else {
            void await this.sendTimelineComment(entityId, '📄 Email не будет отправлен. Только формирование документов', 'email');
            // const timelieneDataWithoutEmail: IBXTimelineComment = {
            //     AUTHOR_ID: '502',
            //     COMMENT: '📄 Email не будет отправлен. Только формирование документов',
            //     ENTITY_TYPE: 'deal',
            //     ENTITY_ID: entityId,
            // };
            // void await this.bitrix.timeline.addTimelineComment(timelieneDataWithoutEmail);
        }

        return { result, filesCount: this.filesForSend.length, files: this.filesForSend, mailResult };

    }
    private async getPpkApplicationFile(
        entityId: number,
        currentPpkApplicationBitrixId: string,
        dto: DocumentGenerateDto,
    ): Promise<void> {
        void await this.sendTimelineComment(entityId, '⏳ Ожидание генерации приложения ППК...', 'waiting');


        try {

            if (dto.ppkApplicationData) {
                const ppkApplicationFileData =
                    await this.ppkApplicationGenerateService.generateDocxBase64(
                        dto.ppkApplicationData

                    );
                void await this.bitrix.deal.update(
                    entityId,
                    {
                        [`${currentPpkApplicationBitrixId}`]: {
                            // @ts-ignore
                            fileData: ppkApplicationFileData,
                        },
                    },
                );
                const updtdDeal = await this.bitrix.deal.get(entityId, [`${currentPpkApplicationBitrixId}`]);
                this.filesForSend.push(ppkApplicationFileData);
                console.log('updtdDeal', updtdDeal);
                //@ts-ignore
                const url = updtdDeal.result[currentPpkApplicationBitrixId]?.downloadUrl as string;

                console.log('URL', url);
                if (url) {
                    void await this.sendTimelineComment(entityId, `📜<a href="${url}"> Приложение ППК сгенерировано №${dto.ppkApplicationData.document_number}</a>`, 'ppk');
                }else{
                    void await this.sendTimelineComment(entityId, '❌ Произошла ошибка: Приложение ППК не сгенерировано', 'error');
                }

            } else {
                void await this.sendTimelineComment(entityId, '❌ Произошла ошибка: Приложение ППК не сгенерировано', 'error');
            }

        } catch (error) {
            void await this.sendTimelineComment(entityId, '❌ Произошла ошибка: Приложение ППК не сгенерировано', 'error');

        }
    }

    private async getActFile(
        entityId: number,
        contractTemplateContentData: { fields: Record<string, string> },
    ): Promise<void> {
        const templateWithoutStampsId = DocumentGenerateTemplatesType.ACT.id;

        const resultAct = await this.addDocumentToDeal(
            entityId,
            0,
            contractTemplateContentData.fields as Record<string, string>,
            Number(templateWithoutStampsId),
            BitrixOwnerTypeId.DEAL,
            EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT,
        );

        // const actDocWithoutPtFileData = await this.bitrix.file.downloadBitrixFileAndConvertToBase64(resultAct.downloadUrlMachine)

        // return actDocWithoutPtFileData
    }

    private async getInvoicesFiles(
        entityId: number,
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

        const resultInvoice = await this.addDocumentToDeal(
            entityId,
            1,
            contractTemplateContentData.fields as Record<string, string>,
            Number(templateWithStampsId),
            BitrixOwnerTypeId.DEAL,
            EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT,
        );

        const resultInvoiceWithoutPt = await this.addDocumentToDeal(
            entityId,
            0,
            contractTemplateContentData.fields as Record<string, string>,
            Number(templateWithoutStampsId),
            BitrixOwnerTypeId.DEAL,
            EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT,
        );

        // const invoicePdf = await this.expectPdfFile(resultInvoice.id)
        // const pdfInvoiceFileData = await this.getPdfFileData(invoicePdf)
        // const invoiceDocWithoutPtFileData = await this.bitrix.file.downloadBitrixFileAndConvertToBase64(resultInvoiceWithoutPt.downloadUrlMachine)

        // return {

        //     invoiceDocWithoutPtFileData,
        //     pdfInvoiceFileData,
        // }
    }
    private async getPdfFileData(
        document: IRequestDocumentGenerateResponse,
    ): Promise<[string, string]> {
        const file =
            await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
                document.pdfUrlMachine,
            );
        return file;
    }
    private async expectPdfFile(fileId: number) {

        let count = 0;
        let result: IRequestDocumentGenerateResponse | null = null;
        while (!result) {
            await delay(15000);
            try {
                const readonly = await this.bitrix.api.call<number>(
                    'crm.documentgenerator.document.get',
                    {
                        id: fileId,
                    },
                );
                const document = readonly.result
                    .document as IRequestDocumentGenerateResponse;


                count++;

                if (document.pdfUrlMachine) {
                    result = document;
                }
            } catch (error) {
                await this.tgBot.sendMessage(error?.message ? `Ошибка при генерации PDF: ${error?.message}` : 'expectPdfFile Ошибка при генерации PDF');
            }
        }
        return result;
    }

    private async addDocumentToDeal(
        entityId: number,
        stampsEnabled: 1 | 0,
        values: Record<string, string>,
        templateId: number,
        entityTypeId: BitrixOwnerTypeId,
        documentCode: EnumDealCurrentDocumentFieldCode,
    ): Promise<void> {
        const generateDocumentData = {
            templateId: templateId,
            entityId: entityId,
            entityTypeId: entityTypeId,
            // providerClassName: 'Bitrix\\DocumentGenerator\\DataProvider\\Rest',
            value: 1,
            stampsEnabled,
            values,

            fields: {
                [DocumentGenerateFieldTemplateCode.Paragraph12]: {
                    TYPE: 'string',
                    MULTIPLE: 'Y',
                    SEPARATOR: 3,
                },
                DocumentNumber: {
                    TYPE: 'string',

                    VALUE: '123',
                },
            },
        };

        this.bitrix.api.addCmdBatch(
            documentCode,
            'crm.documentgenerator.document.add',
            generateDocumentData,
        );

        // const response = await bitrix.api.call<number>(
        //     'crm.documentgenerator.document.add',
        //     generateDocumentData,
        // );
        // return response.result.document as IRequestDocumentGenerateResponse
    }



    private async sendTimelineComment(

        entityId: number,
        comment: string, type: 'error' | 'success' | 'document' | 'pdf' | 'ppk' | 'email' | 'clock' | 'waiting',
        isWaiting: boolean = false
    ): Promise<void> {

        let icon = '❌';

        if (type === 'success') {
            icon = '✅';
        } else if (type === 'document') {
            icon = '📜';
        } else if (type === 'pdf') {
            icon = '📄';
        } else if (type === 'ppk') {
            icon = '📄';
        }

        const timelieneData: IBXTimelineComment = {
            AUTHOR_ID: '502',
            COMMENT: `${comment}`,
            ENTITY_TYPE: 'deal',
            ENTITY_ID: entityId,
        };
        void await this.bitrix.timeline.addTimelineComment(timelieneData);

    }

}
