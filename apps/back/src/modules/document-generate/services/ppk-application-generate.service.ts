import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { StorageService, StorageType } from '@/core/storage';
import { IPpkDocumentApplicationData } from '@alfa/entities';
import { BxTimelineService } from '../../flow/timeline-flow/bx-timeline.service';
import { BitrixService } from '@/modules/bitrix/';

export class PpkApplicationGenerateService {
    constructor(
        private readonly storage: StorageService,
        private readonly bxTimelineService: BxTimelineService,
        private readonly bitrix: BitrixService,
        private readonly filesForSend: [string, string][] = [],
    ) {}

    public async getPpkApplicationFile(
        entityId: number,
        currentPpkApplicationBitrixId: string,
        ppkApplicationData: IPpkDocumentApplicationData,
        //возвращаем причину ошибки: молча терять приложение нельзя,
        //флоу отправит ее в служебный канал
    ): Promise<string | null> {
        void (await this.bxTimelineService.send(
            '⏳ Ожидание генерации приложения ППК...',
            'waiting',
        ));

        try {
            if (ppkApplicationData) {
                const ppkApplicationFileData =
                    await this.generateDocxBase64(ppkApplicationData);
                void (await this.bitrix.deal.update(entityId, {
                    [`${currentPpkApplicationBitrixId}`]: {
                        fileData: ppkApplicationFileData,
                    },
                }));
                // const updtdDeal = await this.bitrix.deal.get(entityId, [
                //     `${currentPpkApplicationBitrixId}`,
                // ]);
                this.filesForSend.push(ppkApplicationFileData);
                return null;

                // const url = (
                //     updtdDeal.result[
                //         currentPpkApplicationBitrixId
                //     ] as IDealFileForDownload
                // )?.downloadUrl;

                // if (url) {
                //     void (await this.bxTimelineService.send(
                //         `📜<a href="${url}"> Приложение ППК сгенерировано №${ppkApplicationData.document_number}</a>`,
                //         'ppk',
                //     ));
                // } else {
                //     void (await this.bxTimelineService.send(
                //         '❌ Произошла ошибка: Приложение ППК не сгенерировано',
                //         'error',
                //     ));
                // }
            } else {
                void (await this.bxTimelineService.send(
                    '❌ Произошла ошибка: Приложение ППК не сгенерировано',
                    'error',
                ));
                return 'нет данных для приложения ППК';
            }
        } catch (error) {
            console.error(error);
            const reason =
                error instanceof Error ? error.message : String(error);
            void (await this.bxTimelineService.send(
                `❌ Произошла ошибка: Приложение ППК не сгенерировано. ${reason}`,
                'error',
            ));
            return reason;
        }

        return null;
    }
    async generateDocxBase64(
        documentData: IPpkDocumentApplicationData,
    ): Promise<[string, string]> {
        const templatePath = this.storage.getFilePath(
            StorageType.APP,
            'ppk/templates',
            'ppk-application.docx',
        );
        const content = await this.storage.readFile(templatePath);

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        doc.setData(documentData);

        try {
            doc.render();
        } catch (error) {
            throw new Error(`Docx render error: ${error}`);
        }

        const buffer = doc.getZip().generate({ type: 'nodebuffer' });
        const fileName = `Приложение №1.docx`;
        const file = buffer.toString('base64');

        return [fileName, file];
    }
}
