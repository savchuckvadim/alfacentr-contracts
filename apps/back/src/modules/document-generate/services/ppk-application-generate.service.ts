import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { StorageService, StorageType } from '@/core/storage';
import { Injectable } from '@nestjs/common';
import {
    EnumPpkApplicationFieldCode,
    EnumPpkApplicationParticipantFieldCode,
    IPpkApplicationParticipant,
    IPpkDocumentApplicationData,
} from '../type/ppk-application.type';

@Injectable()
export class PpkApplicationGenerateService {
    constructor(private readonly storage: StorageService) {}

    async generateDocxBase64(
        data: Record<string, any>,
    ): Promise<[string, string]> {
        const templatePath = this.storage.getFilePath(
            StorageType.APP,
            'ppk/templates',
            'ppk-application.docx',
        );
        const content = await this.storage.readFile(templatePath);

        console.log(templatePath);

        const participants: IPpkApplicationParticipant[] = [
            {
                [EnumPpkApplicationParticipantFieldCode.index]: '1',
                [EnumPpkApplicationParticipantFieldCode.fio]: '123',
                [EnumPpkApplicationParticipantFieldCode.topic]: '123',
                [EnumPpkApplicationParticipantFieldCode.date_start]: '123',
                [EnumPpkApplicationParticipantFieldCode.date_end]: '123',
            },

            {
                [EnumPpkApplicationParticipantFieldCode.index]: '2',
                [EnumPpkApplicationParticipantFieldCode.fio]: '12sdfsdfsdf3',
                [EnumPpkApplicationParticipantFieldCode.topic]: '1sdfsdfsdf23',
                [EnumPpkApplicationParticipantFieldCode.date_start]:
                    '12sdfsdfsdf3',
                [EnumPpkApplicationParticipantFieldCode.date_end]:
                    '12sdfsdfsdf3',
            },
        ];
        const documentData: IPpkDocumentApplicationData = {
            [EnumPpkApplicationFieldCode.prefix]: '123',
            [EnumPpkApplicationFieldCode.document_number]: '123',
            [EnumPpkApplicationFieldCode.day]: '123',
            [EnumPpkApplicationFieldCode.month]: '123',
            [EnumPpkApplicationFieldCode.year]: '123',
            [EnumPpkApplicationFieldCode.participants]: participants,
            [EnumPpkApplicationFieldCode.name_organization]: '123',
            [EnumPpkApplicationFieldCode.position_director]: '123',
            [EnumPpkApplicationFieldCode.signature_director]: '123',
        } as IPpkDocumentApplicationData;

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

        console.log(fileName, file);
        return [fileName, file];
    }
}
