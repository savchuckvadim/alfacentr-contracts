// import { EContractType } from "./document-generate.type"
// //todo вынести в пакет переиспользуемый и для фронта и для бэка
// export interface IRequestDocumentGenerateType {
//     domain: string
//     socketId: string
//     clientType: RQ_TYPE;
//     contractType: EContractType;
//     dealId: number;
//     fields: IRequestDocumentGenerateFieldsType;
// }

// export interface IRequestDocumentGenerateFieldsType {
//     [key: string]: IRequestDocumentGenerateFieldValueType
// }

// export interface IRequestDocumentGenerateFieldValueType {
//     code: string;
//     value: string | string[]
// }
// export enum RQ_TYPE {
//     ORGANIZATION = "org",
//     BUDGET = "org_state",
//     IP = "ip",
//     FIZ = "fiz",
//     ADVOKAT = "advokat",
// }

export interface IRequestDocumentGenerateResponse {
    changeStampsEnabled: true;
    changeQrCodeEnabled: false;
    qrCodeEnabled: false;
    changeQrCodeDisabledReason: 'В шаблоне нет QR-кода';
    products: { currencyId: 'RUB'; totalSum: 34700; totalRows: 4 };
    downloadUrl: string;
    publicUrl: null;
    title: 'Договор Семинар ППК СДЕЛКА 8098';
    number: '8098';
    id: 37172;
    createTime: '2025-07-21T19:48:34+03:00';
    createdBy: 502;
    updateTime: '2025-07-21T19:48:34+03:00';
    updatedBy: null;
    stampsEnabled: true;
    isTransformationError: false;
    values: {
        productsTableVariant: '';
        stampsEnabled: true;
        _creationMethod: 'rest';
        ClientRq: string[];
        Header: 'Общество с ограниченной ответственностью "Альфацентр", именуемое в дальнейшем "ИСПОЛНИТЕЛЬ, в лице Директора Циммера Александра Валентиновича, действующего(-ей) на основании устава с одной стороны и Savchuk Vadim asd, именуемое(-ый) в дальнейшем "ЗАКАЗЧИК с другой стороны, заключили настоящий Договор о нижеследующем:';
        EndActionDate: '2026-07-21';
        Paragraph3: 'Оплата производится на основании счета, либо акта ИСПОЛНИТЕЛЯ не позднее 7 (семи) рабочих дней с момента подписания акта оказанных услуг. В соответствии с условиями настоящего ДОГОВОРА, ЗАКАЗЧИК перечисляет денежные средства на расчетный счет ИСПОЛНИТЕЛЯ.';
    };
    templateId: '134';
    pullTag: 'TRANSFORMDOCUMENT37172';
    emailDiskFile: 3159516;
    entityId: 34028;
    entityTypeId: '2';
    downloadUrlMachine: string;
    imageUrl: string;
    pdfUrl: string;
    pdfUrlMachine: string;
}
