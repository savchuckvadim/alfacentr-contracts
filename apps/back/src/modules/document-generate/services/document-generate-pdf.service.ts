import {
    currentDocumentFields,
    EnumDealCurrentDocumentFieldCode,
} from '@alfa/entities';
import { IRequestDocumentGenerateResponse } from '../type/request-document-generate.type';
import { delay } from '@/lib';
import { BitrixService } from '@/modules/bitrix/';

import { TelegramService } from '@/modules/telegram/telegram.service';
import { IBitrixBatchResponseResult } from '@/modules/bitrix/core/interface/bitrix-api.intterface';
import { BxTimelineService } from '../../flow/timeline-flow/bx-timeline.service';

export class DocumentGeneratePdfService {
    // private filesForSend: [string, string][] = [];

    constructor(
        private readonly bitrix: BitrixService,
        private readonly timelineService: BxTimelineService,
        private filesForSend: [string, string][] = [],
        private readonly tgBot: TelegramService,
    ) { }

    async pdfGenerate(dto: IBitrixBatchResponseResult[], entityId: number) {
        void (await this.timelineService.send(
            '⌛ Ожидание генерации PDF ...',
            'waiting',
        ));

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

        for (const item of dto) {
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

            // const dealFields = {
            //     // [`${currentContractBitrixId}`]: {
            //     //     // @ts-ignore
            //     //     fileData: null as [string, string] | null,
            //     // },
            //     [`${currentContractWithoutPtBitrixId}`]: {
            //         // @ts-ignore
            //         fileData: null as [string, string] | null,
            //     },
            //     [`${currentInvoicesBitrixId}`]: {
            //         // @ts-ignore
            //         fileData: null as [string, string] | null,
            //     },
            //     [`${currentInvoicesWithoutPtBitrixId}`]: {
            //         // @ts-ignore
            //         fileData: null as [string, string] | null,
            //     },
            //     [`${currentActBitrixId}`]: {
            //         // @ts-ignore
            //         fileData: null as [string, string] | null,
            //     },
            // };

            for (const key in documentResults) {
                const document = documentResults[key].document;
                switch (key) {
                    case EnumDealCurrentDocumentFieldCode.CURRENT_ACT_WITH_PT:
                        const actDocumentFileData =
                            await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
                                document.downloadUrlMachine,
                            );
                        // dealFields[`${currentActBitrixId}`].fileData =
                        //     actDocumentFileData;
                        this.filesForSend.push(actDocumentFileData);
                        break;
                    case EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT:
                        const invoicePdf = await this.expectPdfFile(
                            document.id,
                        );
                        const pdfInvoiceFileData =
                            await this.getPdfFileData(invoicePdf);
                        // dealFields[`${currentInvoicesBitrixId}`].fileData =
                        //     pdfInvoiceFileData;
                        this.filesForSend.push(pdfInvoiceFileData);
                        break;
                    case EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT:
                        const invoiceDocWithoutPtFileData =
                            await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
                                document.downloadUrlMachine,
                            );
                        // dealFields[
                        //     `${currentInvoicesWithoutPtBitrixId}`
                        // ].fileData = invoiceDocWithoutPtFileData;
                        this.filesForSend.push(invoiceDocWithoutPtFileData);
                        break;
                    case EnumDealCurrentDocumentFieldCode.CURRENT_CONTRACT_WITHOUT_PT:
                        const contractDocWithoutPtFileData =
                            await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
                                document.downloadUrlMachine,
                            );
                        // dealFields[
                        //     `${currentContractWithoutPtBitrixId}`
                        // ].fileData = contractDocWithoutPtFileData;
                        this.filesForSend.push(contractDocWithoutPtFileData);
                }
            }

            // void (await this.bitrix.deal.update(
            //     entityId,
            //     // @ts-ignore
            //     dealFields,
            // ));
        }
        void (await this.timelineService.send(
            '📜 PDF сгенерирован',
            'document',
        ));
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

                void (await this.timelineService.send(
                    '❌ Ошибка при генерации PDF',
                    'error',
                ));

                // error?.message
                //     && typeof error?.message === 'string'
                //     && void (await this.timelineService.send(
                //         `❌ Ошибка при генерации PDF: ${error?.message}`,
                //         'error',
                //     ));

                await this.tgBot.sendMessage(
                    error?.message
                        ? `Ошибка при генерации PDF: ${error?.message}`
                        : 'expectPdfFile Ошибка при генерации PDF',
                );
            }
        }
        return result;
    }
}
