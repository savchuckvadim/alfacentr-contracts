// import { DocumentGenerateDto } from '../dto/document-generate.dto';
// import { PBXService } from '@/modules/pbx/';
// import { BitrixOwnerTypeId } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
// import { DocumentContractFieldsService } from './document-contract-fields.service';
// import {
//     currentDocumentFields,
//     DocumentGenerateFieldTemplateCode,
//     DocumentGenerateTemplatesType,
//     EContractType,
//     EnumDealCurrentDocumentFieldCode,
//     RQ_TYPE,
// } from '@alfa/entities';
// import { IRequestDocumentGenerateResponse } from '../type/request-document-generate.type';
// import { delay } from '@/lib';
// import { BitrixService } from '@/modules/bitrix/';
// import { PpkApplicationGenerateService } from './ppk-application-generate.service';
// import { EmailService } from '../../flow/email-flow/email.service';
// import { TelegramService } from '@/modules/telegram/telegram.service';
// import { BxTimelineService } from '../../flow/timeline-flow/bx-timeline.service';
// import { BxBatchDocumentSendService } from './bx-document-send.service';

// export class DocumentGenerateBatchService {
//     private bitrix: BitrixService;
//     private filesForSend: [string, string][] = [];
//     private userId: number;
//     private bxTimelineService: BxTimelineService;
//     private bxDocumentSendService: BxBatchDocumentSendService;
//     constructor(
//         private readonly pbxService: PBXService,
//         private readonly documentContractFieldsService: DocumentContractFieldsService,
//         private readonly ppkApplicationGenerateService: PpkApplicationGenerateService,
//         private readonly tgBot: TelegramService,
//     ) { }

//     async generateDocument(dto: DocumentGenerateDto) {
//         const { bitrix } = await this.pbxService.init('alfacentr.bitrix24.ru');
//         this.bitrix = bitrix;
//         this.userId = dto.userId;
//         const entityId = Number(dto.dealId);
//         this.bxTimelineService = new BxTimelineService(
//             this.bitrix,
//             this.userId,
//             entityId,
//         );
//         this.bxDocumentSendService = new BxBatchDocumentSendService(
//             this.bitrix,
//             entityId,
//             BitrixOwnerTypeId.DEAL,
//         );

//         const contractTemplateContentData =
//             this.documentContractFieldsService.getContractFields(
//                 dto.clientType,
//                 dto.contractType,
//                 dto.header,
//                 // dto.paragraph,
//                 dto.paragraphItems || [],
//                 dto.totalSum,
//                 dto.client,
//                 dto.clientSignature,
//                 dto.documentPrefixNumber,
//                 dto.documentCounter,
//                 dto.email.email,
//                 dto.seminarParticipantsCount,
//             );

//         void (await this.bxDocumentSendService.add(
//             0,
//             contractTemplateContentData.fields as Record<string, string>,
//             Number(contractTemplateContentData.templateId),
//             EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT,
//         ));

//         const currentContractWithoutPtBitrixId =
//             currentDocumentFields[
//                 EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT
//             ].bitrixId;
//         const currentInvoicesBitrixId =
//             currentDocumentFields[
//                 EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT
//             ].bitrixId;
//         const currentInvoicesWithoutPtBitrixId =
//             currentDocumentFields[
//                 EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT
//             ].bitrixId;
//         const currentActBitrixId =
//             currentDocumentFields[
//                 EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT
//             ].bitrixId;
//         void (await this.getActFile({
//             fields: {
//                 UfCrm8ShotReqClient: dto.clientShortRq,
//                 ShortClientRq: dto.clientShortRq,
//                 DocumentNumber: dto.documentCounter,
//                 TITLE: dto.documentPrefixNumber,
//                 DocumentTitle: `УПД №${dto.documentCounter} к Договору №${dto.documentPrefixNumber}`,
//                 DocumentPrefixNumber: dto.documentPrefixNumber,
//                 DocumentNumberCounter: dto.documentCounter,
//                 DocumentCompanyTitle: dto.clientCompanyTitle,
//                 DocumentDirectorInitials: dto.clientDirectorInitials,
//                 [DocumentGenerateFieldTemplateCode.ACT_DATE]: dto.actDate,
//                 [DocumentGenerateFieldTemplateCode.CLIENT_SHORT_NAME]:
//                     dto.clientCompanyShortTitle,
//                 [DocumentGenerateFieldTemplateCode.CLIENT_UPD_ADDRESS]:
//                     dto.clientUpdAddress,
//                 [DocumentGenerateFieldTemplateCode.CLIENT_UPD_INN_KPP]:
//                     dto.clientUpdInnKpp,
//             } as Record<string, string>,
//         }));

//         const currentPpkApplicationBitrixId =
//             currentDocumentFields[
//                 EnumDealCurrentDocumentFieldCode.CURRENT_APPLICATION_DOC
//             ].bitrixId;

//         await this.getInvoicesFiles(dto.clientType, {
//             fields: {
//                 ShortClientRq: dto.clientShortRq,

//                 DocumentPrefixNumber: dto.documentPrefixNumber,
//                 DocumentNumberCounter: dto.documentCounter,
//                 DocumentTitle: `Счет №${dto.documentCounter} к Договору №${dto.documentPrefixNumber}`,
//             } as Record<string, string>,
//         });
//         const result = await this.bitrix.api.callBatchWithConcurrency(1);

//         void (await this.bxTimelineService.send(
//             '⌛ Ожидание генерации PDF ...',
//             'waiting',
//         ));

//         for (const item of result) {
//             const documentResults = item.result as {
//                 [EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT]: {
//                     document: IRequestDocumentGenerateResponse;
//                 };
//                 [EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT]: {
//                     document: IRequestDocumentGenerateResponse;
//                 };
//                 [EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITH_PT]: {
//                     document: IRequestDocumentGenerateResponse;
//                 };
//                 [EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT]: {
//                     document: IRequestDocumentGenerateResponse;
//                 };
//                 [EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT]: {
//                     document: IRequestDocumentGenerateResponse;
//                 };
//             };

//             const dealFields = {
//                 // [`${currentContractBitrixId}`]: {
//                 //     // @ts-ignore
//                 //     fileData: null as [string, string] | null,
//                 // },
//                 [`${currentContractWithoutPtBitrixId}`]: {
//                     // @ts-ignore
//                     fileData: null as [string, string] | null,
//                 },
//                 [`${currentInvoicesBitrixId}`]: {
//                     // @ts-ignore
//                     fileData: null as [string, string] | null,
//                 },
//                 [`${currentInvoicesWithoutPtBitrixId}`]: {
//                     // @ts-ignore
//                     fileData: null as [string, string] | null,
//                 },
//                 [`${currentActBitrixId}`]: {
//                     // @ts-ignore
//                     fileData: null as [string, string] | null,
//                 },
//             };

//             const documentResultKeys = Object.keys(documentResults) as Array<
//                 keyof typeof documentResults
//             >;

//             for (const key of documentResultKeys) {
//                 const document = documentResults[key].document;
//                 switch (key) {
//                     case EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT:
//                         const actDocumentFileData =
//                             await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
//                                 document.downloadUrlMachine,
//                             );
//                         dealFields[`${currentActBitrixId}`].fileData =
//                             actDocumentFileData;
//                         this.filesForSend.push(actDocumentFileData);
//                         break;
//                     case EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT:
//                         const invoicePdf = await this.expectPdfFile(
//                             document.id,
//                         );
//                         const pdfInvoiceFileData =
//                             await this.getPdfFileData(invoicePdf);
//                         dealFields[`${currentInvoicesBitrixId}`].fileData =
//                             pdfInvoiceFileData;
//                         this.filesForSend.push(pdfInvoiceFileData);

//                         break;
//                     case EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT:
//                         const invoiceDocWithoutPtFileData =
//                             await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
//                                 document.downloadUrlMachine,
//                             );
//                         dealFields[
//                             `${currentInvoicesWithoutPtBitrixId}`
//                         ].fileData = invoiceDocWithoutPtFileData;
//                         this.filesForSend.push(invoiceDocWithoutPtFileData);
//                         break;
//                     case EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT:
//                         const contractDocWithoutPtFileData =
//                             await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
//                                 document.downloadUrlMachine,
//                             );
//                         dealFields[
//                             `${currentContractWithoutPtBitrixId}`
//                         ].fileData = contractDocWithoutPtFileData;
//                         this.filesForSend.push(contractDocWithoutPtFileData);
//                 }
//             }

//             void (await this.bitrix.deal.update(
//                 entityId,
//                 // @ts-ignore
//                 dealFields,
//             ));
//         }
//         void (await this.bxTimelineService.send(
//             '📜 PDF сгенерирован',
//             'document',
//         ));

//         if (
//             dto.contractType === EContractType.seminar_ppk ||
//             dto.contractType === EContractType.ppk
//         ) {
//             void (await this.getPpkApplicationFile(
//                 entityId,
//                 currentPpkApplicationBitrixId,
//                 dto,
//             ));
//         }

//         void (await this.bxTimelineService.send(
//             '✅ Документы сгенерированы',
//             'success',
//         ));

//         let mailResult: any = null;
//         if (dto.email.needEmail && dto.email.email) {
//             await delay(1100);
//             void (await this.bxTimelineService.send(
//                 '⌛ Отправка email...',
//                 'email',
//             ));

//             const emailService = new EmailService(
//                 this.bitrix,
//                 this.filesForSend,
//                 dto.email.email,
//                 dto.email.name || '',
//                 dto.email.phone || '',
//                 dto.documentPrefixNumber,
//                 '',
//                 dto.dealId,
//                 dto.userEmail,
//                 0,
//             );
//             mailResult = await emailService.send();
//         } else {
//             void (await this.bxTimelineService.send(
//                 '📄 Email не будет отправлен. Только формирование документов',
//                 'email',
//             ));
//         }

//         return {
//             result,
//             filesCount: this.filesForSend.length,
//             files: this.filesForSend,
//             mailResult,
//         };
//     }
//     private async getPpkApplicationFile(
//         entityId: number,
//         currentPpkApplicationBitrixId: string,
//         dto: DocumentGenerateDto,
//     ): Promise<void> {
//         void (await this.bxTimelineService.send(
//             '⏳ Ожидание генерации приложения ППК...',
//             'waiting',
//         ));

//         try {
//             if (dto.ppkApplicationData) {
//                 const ppkApplicationFileData =
//                     await this.ppkApplicationGenerateService.generateDocxBase64(
//                         dto.ppkApplicationData,
//                     );
//                 void (await this.bitrix.deal.update(entityId, {
//                     [`${currentPpkApplicationBitrixId}`]: {
//                         // @ts-ignore
//                         fileData: ppkApplicationFileData,
//                     },
//                 }));
//                 const updtdDeal = await this.bitrix.deal.get(entityId, [
//                     `${currentPpkApplicationBitrixId}`,
//                 ]);
//                 this.filesForSend.push(ppkApplicationFileData);

//                 //@ts-ignore
//                 const url = updtdDeal.result[currentPpkApplicationBitrixId]?.downloadUrl as string;

//                 if (url) {
//                     void (await this.bxTimelineService.send(
//                         `📜<a href="${url}"> Приложение ППК сгенерировано №${dto.ppkApplicationData.document_number}</a>`,
//                         'ppk',
//                     ));
//                 } else {
//                     void (await this.bxTimelineService.send(
//                         '❌ Произошла ошибка: Приложение ППК не сгенерировано',
//                         'error',
//                     ));
//                 }
//             } else {
//                 void (await this.bxTimelineService.send(
//                     '❌ Произошла ошибка: Приложение ППК не сгенерировано',
//                     'error',
//                 ));
//             }
//         } catch (error) {
//             void (await this.bxTimelineService.send(
//                 '❌ Произошла ошибка: Приложение ППК не сгенерировано',
//                 'error',
//             ));
//         }
//     }

//     private async getActFile(contractTemplateContentData: {
//         fields: Record<string, string>;
//     }): Promise<void> {
//         const templateWithoutStampsId = DocumentGenerateTemplatesType.ACT.id;

//         void (await this.bxDocumentSendService.add(
//             0,
//             contractTemplateContentData.fields as Record<string, string>,
//             Number(templateWithoutStampsId),

//             EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT,
//         ));
//     }

//     private async getInvoicesFiles(
//         clientType: RQ_TYPE,
//         contractTemplateContentData: { fields: Record<string, string> },
//     ) {
//         const templateWithoutStampsId =
//             clientType === RQ_TYPE.FIZ
//                 ? DocumentGenerateTemplatesType.INVOISE_QR_WITHOUT_STAMPS.id
//                 : DocumentGenerateTemplatesType.INVOISE_WITHOUT_STAMPS.id;

//         const templateWithStampsId =
//             clientType === RQ_TYPE.FIZ
//                 ? DocumentGenerateTemplatesType.INVOISE_QR_WITH_STAMPS.id
//                 : DocumentGenerateTemplatesType.INVOISE_WITH_STAMPS.id;

//         void (await this.bxDocumentSendService.add(
//             1,
//             contractTemplateContentData.fields as Record<string, string>,
//             Number(templateWithStampsId),

//             EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT,
//         ));

//         void (await this.bxDocumentSendService.add(
//             0,
//             contractTemplateContentData.fields as Record<string, string>,
//             Number(templateWithoutStampsId),

//             EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT,
//         ));
//     }
//     private async getPdfFileData(
//         document: IRequestDocumentGenerateResponse,
//     ): Promise<[string, string]> {
//         const file =
//             await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
//                 document.pdfUrlMachine,
//             );
//         return file;
//     }
//     private async expectPdfFile(fileId: number) {
//         let count = 0;
//         let result: IRequestDocumentGenerateResponse | null = null;
//         while (!result) {
//             await delay(15000);
//             try {
//                 const readonly = await this.bitrix.api.call<number>(
//                     'crm.documentgenerator.document.get',
//                     {
//                         id: fileId,
//                     },
//                 );
//                 const document = readonly.result
//                     .document as IRequestDocumentGenerateResponse;

//                 count++;

//                 if (document.pdfUrlMachine) {
//                     result = document;
//                 }
//             } catch (error) {
//                 await this.tgBot.sendMessage(
//                     error?.message
//                         ? `Ошибка при генерации PDF: ${error?.message}`
//                         : 'expectPdfFile Ошибка при генерации PDF',
//                 );
//             }
//         }
//         return result;
//     }
// }
