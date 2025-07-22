import { DocumentGenerateTemplatesType, EContractType } from '@alfa/entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentContractFieldsService {
    constructor() {}

    getContractFields(
        contractType: EContractType,
        header: string,
        paragraph: string,
        totalSum: string,
        client: string[],
    ) {
        const templateType =
            contractType === EContractType.seminar_ppk
                ? DocumentGenerateTemplatesType.SEMINAR_PPK_DEAL
                : DocumentGenerateTemplatesType.INVOISE_WITH_STAMPS;
        const templateId = templateType.id;

        const fields = {} as { [key: string]: string | string[] };

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 365);
        const lastDayOfYearString = endDate.toISOString().split('T')[0];
        const paragraph3 = `Оплата производится на основании счета, либо акта ИСПОЛНИТЕЛЯ не позднее 7 (семи) рабочих дней с момента подписания акта оказанных услуг. В соответствии с условиями настоящего ДОГОВОРА, ЗАКАЗЧИК перечисляет денежные средства на расчетный счет ИСПОЛНИТЕЛЯ.`;

        templateType.fields.forEach((field) => {
            if (field.code === 'Header') {
                fields[field.templateCode] = header;
            } else if (field.code === 'Paragraph12') {
                fields[field.templateCode] = paragraph;
            } else if (field.code === 'TotalSum') {
                fields[field.templateCode] = totalSum;
            } else if (field.code === 'client') {
                fields[field.templateCode] = client;
            } else if (field.code === 'endDate') {
                fields[field.templateCode] = lastDayOfYearString;
            } else if (field.code === 'paragraph3') {
                fields[field.templateCode] = paragraph3;
            }
        });
        return {
            templateId,
            fields,
        };
    }
}
