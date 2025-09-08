import {
    DocumentContractInvoiceWithStampsFieldsType,
    DocumentContractPpkDealFieldsType,
    DocumentContractSeminarDealFieldsType,
    DocumentContractSeminarPpkFieldsType,
    DocumentGenerateFieldTemplateCode,
    DocumentGenerateTemplatesType,
    DocumentGenerateTemplateType,
    EContractType,
} from '@alfa/entities';
import { Injectable } from '@nestjs/common';


@Injectable()
export class DocumentContractFieldsService {
    constructor() { }

    getContractFields(
        contractType: EContractType,
        header: string,
        // paragraph3: string,
        paragraphItems: string[],
        totalSum: string,
        client: string[],
        clientSignature: string,
        documentPrefixNumber: string,
        documentNumberCounter: string,
        emailForDoc: string = '____________________________________________',
        seminarParticipantsCount: string = '____________________________________________',

    ) {



        const templateType =
            contractType === EContractType.seminar_ppk
                ? (DocumentGenerateTemplatesType.SEMINAR_PPK_DEAL as typeof DocumentGenerateTemplatesType.SEMINAR_PPK_DEAL)
                : contractType === EContractType.seminar
                    ? (DocumentGenerateTemplatesType.SEMINAR_DEAL as typeof DocumentGenerateTemplatesType.SEMINAR_DEAL)
                    : contractType === EContractType.ppk
                        ? (DocumentGenerateTemplatesType.PPK_DEAL as typeof DocumentGenerateTemplatesType.PPK_DEAL)
                        : (DocumentGenerateTemplatesType.INVOISE_WITH_STAMPS as typeof DocumentGenerateTemplatesType.INVOISE_WITH_STAMPS);
        const templateId = templateType.id;

        const fields = {} as { [key: string]: string | string[] };

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 365);
        const lastDayOfYearString = endDate.toISOString().split('T')[0];
        const paragraph3 = `Оплата производится на основании счета, либо акта ИСПОЛНИТЕЛЯ не позднее 7 (семи) рабочих дней с момента подписания акта оказанных услуг. В соответствии с условиями настоящего ДОГОВОРА, ЗАКАЗЧИК перечисляет денежные средства на расчетный счет ИСПОЛНИТЕЛЯ.`;
        const paragraph = this.getParagraphByItems(paragraphItems);

        const templateFields =
            contractType === EContractType.seminar_ppk
                ? (DocumentGenerateTemplatesType.SEMINAR_PPK_DEAL
                    .fields as DocumentContractSeminarPpkFieldsType)
                : contractType === EContractType.seminar
                    ? (DocumentGenerateTemplatesType.SEMINAR_DEAL
                        .fields as DocumentContractSeminarDealFieldsType)
                    : contractType === EContractType.ppk
                        ? (DocumentGenerateTemplatesType.PPK_DEAL
                            .fields as DocumentContractPpkDealFieldsType)
                        : (DocumentGenerateTemplatesType.INVOISE_WITH_STAMPS
                            .fields as DocumentContractInvoiceWithStampsFieldsType);

        templateFields.forEach((field) => {
            if (field.code === DocumentGenerateFieldTemplateCode.Header) {
                fields[field.templateCode] = header;
            } else if (
                field.code === DocumentGenerateFieldTemplateCode.Paragraph12
            ) {
                fields[field.templateCode] = paragraph;
            } else if (
                field.code === DocumentGenerateFieldTemplateCode.ClientRq
            ) {
                fields[field.templateCode] = client;
            } else if (
                field.code === DocumentGenerateFieldTemplateCode.EndActionDate
            ) {
                fields[field.templateCode] = lastDayOfYearString;
            } else if (
                field.code === DocumentGenerateFieldTemplateCode.Paragraph3
            ) {
                fields[field.templateCode] = paragraph3;
            } else if (
                field.code ===
                DocumentGenerateFieldTemplateCode.DocumentPrefixNumber
            ) {
                fields[field.templateCode] = documentPrefixNumber;
            } else if (
                field.code ===
                DocumentGenerateFieldTemplateCode.DocumentNumberCounter
            ) {
                fields[field.templateCode] = documentPrefixNumber;
            } else if (
                field.code ===
                DocumentGenerateFieldTemplateCode.ClientSignature
            ) {
                fields[field.templateCode] = clientSignature;
            } else if (
                field.code ===
                DocumentGenerateFieldTemplateCode.DocumentParticipantsCount
            ) {
                fields[field.templateCode] = seminarParticipantsCount;
            } else if (
                field.code ===
                DocumentGenerateFieldTemplateCode.DocumentContractEndDate
            ) {
                fields[field.templateCode] = lastDayOfYearString;
            } else if (
                field.code ===
                DocumentGenerateFieldTemplateCode.UfCrm8EmailContactForDor
            ) {
                fields[field.templateCode] = emailForDoc;
            }
        });
        // fields['DocumentNumber'] = documentPrefixNumber;
        // fields['TITLE'] = documentPrefixNumber;
        // fields['Title'] = documentPrefixNumber;
        fields['DocumentTitle'] = `Договор №${documentPrefixNumber}`;

        return {
            templateId,
            fields,
        };
    }
    private getParagraphByItems(paragraphItems: string[]) {
        if (paragraphItems.length === 0) {
            return '___________________________________________________________________________________________________________________\n';
        }
        const paragraphTitle =
            paragraphItems.length > 1
                ? 'Консультационных семинарах :  ' + paragraphItems[0]
                : 'Консультационном семинаре :  ' + paragraphItems[0];

        return paragraphItems.length < 2
            ? [paragraphTitle + paragraphItems.slice(1).join('')]
            : [paragraphTitle, ...paragraphItems.slice(1)];
    }
}
