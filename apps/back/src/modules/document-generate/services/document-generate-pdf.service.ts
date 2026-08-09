import {
    currentDocumentFields,
    EnumDealCurrentDocumentFieldCode,
} from '@alfa/entities';
import { IRequestDocumentGenerateResponse } from '../type/request-document-generate.type';
import { delay } from '@/lib';
import { BitrixService } from '@/modules/bitrix/';

import { IBitrixBatchResponseResult } from '@/modules/bitrix/core/interface/bitrix-api.intterface';
import { BxTimelineService } from '../../flow/timeline-flow/bx-timeline.service';
import {
    DOCUMENT_WAIT_ERROR_INTERVAL_MS,
    DOCUMENT_WAIT_INTERVAL_MS,
    DOCUMENT_WAIT_TIMEOUT_MS,
} from '../const/document-wait.const';

export class DocumentGeneratePdfService {
    // private filesForSend: [string, string][] = [];


    constructor(
        private readonly bitrix: BitrixService,
        private readonly timelineService: BxTimelineService,
        private filesForSend: [string, string][] = [],
    ) { }

    /**
     * Возвращает true, если бюджет ожидания pdf был исчерпан — тогда
     * поле сделки останется пустым и ждать его заполнения дальше бессмысленно
     */
    async pdfGenerate(
        dto: IBitrixBatchResponseResult[],
        entityId: number,
    ): Promise<boolean> {
        void (await this.timelineService.send(
            '⌛ Ожидание генерации PDF ...',
            'waiting',
        ));
        let isPdfWaitExhausted = false;

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
                        const actDocumentFileData =
                            await this.bitrix.file.downloadBitrixFileAndConvertToBase64(
                                document.downloadUrlMachine,
                            );
                        dealFields[`${currentActBitrixId}`].fileData =
                            actDocumentFileData;
                        this.filesForSend.push(actDocumentFileData);
                        break;
                    case EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITH_PT:
                        const invoicePdf = await this.expectPdfFile(
                            document.id,
                        );
                        //pdf не появился за отведенное время — поле сделки
                        //останется пустым, это поймает проверка готовности
                        if (!invoicePdf) {
                            isPdfWaitExhausted = true;
                            void (await this.timelineService.send(
                                '⚠️ Битрикс не сформировал pdf счета с печатью за отведенное время',
                                'error',
                            ));
                            break;
                        }
                        const pdfInvoiceFileData =
                            await this.getPdfFileData(invoicePdf);
                        dealFields[`${currentInvoicesBitrixId}`].fileData =
                            pdfInvoiceFileData;
                        this.filesForSend.push(pdfInvoiceFileData);
                        break;
                    case EnumDealCurrentDocumentFieldCode.CURRENT_INVOICES_WITHOUT_PT:
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
                }
            }

            void (await this.bitrix.deal.update(
                entityId,
                // @ts-ignore
                dealFields,
            ));
        }
        void (await this.timelineService.send(
            '📜 PDF сгенерирован',
            'document',
        ));

        return isPdfWaitExhausted;
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
    /**
     * Ждет, пока битрикс сформирует pdf, но не дольше бюджета ожидания.
     * Возвращает null, если pdf так и не появился — раньше цикл висел вечно
     */
    private async expectPdfFile(
        fileId: number,
    ): Promise<IRequestDocumentGenerateResponse | null> {
        const deadline = Date.now() + DOCUMENT_WAIT_TIMEOUT_MS;
        let result: IRequestDocumentGenerateResponse | null = null;

        while (!result && Date.now() < deadline) {
            await delay(DOCUMENT_WAIT_INTERVAL_MS);
            try {
                const readonly = await this.bitrix.api.call<number>(
                    'crm.documentgenerator.document.get',
                    {
                        id: fileId,
                    },
                );
                const document = readonly.result
                    .document as IRequestDocumentGenerateResponse;

                if (document.pdfUrlMachine) {
                    result = document;
                }
            } catch (error) {
                console.error(error);
                //не кидаем ошибку в timeline — просто ждем и пробуем снова
                await delay(DOCUMENT_WAIT_ERROR_INTERVAL_MS);
            }
        }

        return result;
    }
}
