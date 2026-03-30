import {
    DocumentContractInvoiceWithStampsFieldsType,
    DocumentContractPpkDealFieldsType,
    DocumentContractSeminarDealFieldsType,
    DocumentContractSeminarPpkFieldsType,
    DocumentContractUPComplectFieldsType,
    DocumentContractUPVideoFieldsType,
    DocumentGenerateFieldTemplateCode,
    DocumentGenerateTemplatesType,
    EContractType,
    RQ_TYPE,
} from '@alfa/entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentContractFieldsService {
    constructor() {}

    getContractFields(
        clientType: RQ_TYPE,
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
    ): {
        templateId: number;
        fields: Record<string, string | string[]>;
    } {
        const templateType = this.getTemplateType(contractType);
        const templateId = this.getTemplateId(templateType);

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 365);
        const lastDayOfYearString = endDate.toISOString().split('T')[0];

        const paragraph3 = this.getParagraph3ByClientType(clientType);
        const paragraph = this.getParagraphByItems(paragraphItems);

        const templateFields = this.getTemplateFields(templateType);

        const fields = this.getValuedFields(
            header,
            paragraph,
            client,
            lastDayOfYearString,
            paragraph3,
            documentPrefixNumber,
            clientSignature,
            seminarParticipantsCount,
            emailForDoc,
            templateFields,
        );
        return {
            templateId,
            fields,
        };
    }

    private getTemplateType(
        contractType: EContractType,
    ):
        | typeof DocumentGenerateTemplatesType.SEMINAR_PPK_DEAL
        | typeof DocumentGenerateTemplatesType.SEMINAR_DEAL
        | typeof DocumentGenerateTemplatesType.PPK_DEAL
        | typeof DocumentGenerateTemplatesType.INVOISE_WITH_STAMPS
        | typeof DocumentGenerateTemplatesType.UP_COMPLECT
        | typeof DocumentGenerateTemplatesType.UP_VIDEO {
        const templateType =
            contractType === EContractType.seminar_ppk
                ? DocumentGenerateTemplatesType.SEMINAR_PPK_DEAL
                : contractType === EContractType.seminar
                  ? DocumentGenerateTemplatesType.SEMINAR_DEAL
                  : contractType === EContractType.ppk
                    ? DocumentGenerateTemplatesType.PPK_DEAL
                    : contractType === EContractType.up_complect
                      ? DocumentGenerateTemplatesType.UP_COMPLECT
                      : contractType === EContractType.up_video
                        ? DocumentGenerateTemplatesType.UP_VIDEO
                        : DocumentGenerateTemplatesType.INVOISE_WITH_STAMPS;
        return templateType;
    }
    private getTemplateId(
        templateType: (typeof DocumentGenerateTemplatesType)[keyof typeof DocumentGenerateTemplatesType],
    ) {
        const templateId = templateType.id;
        return templateId;
    }

    private getTemplateFields(
        templateType:
            | typeof DocumentGenerateTemplatesType.SEMINAR_PPK_DEAL
            | typeof DocumentGenerateTemplatesType.SEMINAR_DEAL
            | typeof DocumentGenerateTemplatesType.PPK_DEAL
            | typeof DocumentGenerateTemplatesType.INVOISE_WITH_STAMPS
            | typeof DocumentGenerateTemplatesType.UP_COMPLECT
            | typeof DocumentGenerateTemplatesType.UP_VIDEO,
    ):
        | DocumentContractSeminarPpkFieldsType
        | DocumentContractSeminarDealFieldsType
        | DocumentContractPpkDealFieldsType
        | DocumentContractInvoiceWithStampsFieldsType
        | DocumentContractUPComplectFieldsType
        | DocumentContractUPVideoFieldsType {
        return templateType.fields;
    }

    private getValuedFields(
        header: string,
        paragraph: string | string[],
        client: string[],
        lastDayOfYearString: string,
        paragraph3: string,
        documentPrefixNumber: string,
        clientSignature: string,
        seminarParticipantsCount: string,
        emailForDoc: string,

        templateFields:
            | DocumentContractSeminarPpkFieldsType
            | DocumentContractSeminarDealFieldsType
            | DocumentContractPpkDealFieldsType
            | DocumentContractInvoiceWithStampsFieldsType
            | DocumentContractUPComplectFieldsType
            | DocumentContractUPVideoFieldsType,
    ) {
        const fields = {} as { [key: string]: string | string[] };

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
                field.code === DocumentGenerateFieldTemplateCode.ClientSignature
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

        return fields;
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

    private getParagraph3ByClientType(clientType: RQ_TYPE) {
        const fizParagraph3 = `Оплата производится на основании счета, либо УПД ИСПОЛНИТЕЛЯ не позднее 3 (трех) рабочих дней с момента получения счета. В соответствии с условиями настоящего ДОГОВОРА, ЗАКАЗЧИК перечисляет денежные средства на расчетный счет ИСПОЛНИТЕЛЯ.`;
        const organizationParagraph3 = `Оплата производится на основании счета, либо УПД ИСПОЛНИТЕЛЯ не позднее 7 (семи) рабочих дней с момента подписания УПД. В соответствии с условиями настоящего ДОГОВОРА, ЗАКАЗЧИК перечисляет денежные средства на расчетный счет ИСПОЛНИТЕЛЯ.`;
        return clientType === RQ_TYPE.FIZ
            ? fizParagraph3
            : organizationParagraph3;
    }
}
