import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { StorageService, StorageType } from '@/core/storage';
import { IPpkDocumentApplicationData } from '@alfa/entities';
import { BxTimelineService } from './bx-timeline.service';
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
    ): Promise<void> {
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
                        // @ts-ignore
                        fileData: ppkApplicationFileData,
                    },
                }));
                const updtdDeal = await this.bitrix.deal.get(entityId, [
                    `${currentPpkApplicationBitrixId}`,
                ]);
                this.filesForSend.push(ppkApplicationFileData);

                //@ts-ignore
                const url = updtdDeal.result[currentPpkApplicationBitrixId]?.downloadUrl as string;

                if (url) {
                    void (await this.bxTimelineService.send(
                        `📜<a href="${url}"> Приложение ППК сгенерировано №${ppkApplicationData.document_number}</a>`,
                        'ppk',
                    ));
                } else {
                    void (await this.bxTimelineService.send(
                        '❌ Произошла ошибка: Приложение ППК не сгенерировано',
                        'error',
                    ));
                }
            } else {
                void (await this.bxTimelineService.send(
                    '❌ Произошла ошибка: Приложение ППК не сгенерировано',
                    'error',
                ));
            }
        } catch (error) {
            void (await this.bxTimelineService.send(
                '❌ Произошла ошибка: Приложение ППК не сгенерировано',
                'error',
            ));
        }
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
