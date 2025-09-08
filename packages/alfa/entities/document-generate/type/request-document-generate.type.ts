
import { EContractType } from './document-generate.type';
//todo вынести в пакет переиспользуемый и для фронта и для бэка
export interface IRequestDocumentGenerateType {
    domain: string;
    socketId?: string;
    clientType: RQ_TYPE;
    contractType: EContractType;
    dealId: number;
    header: string;
    paragraph: string;
    totalSum: string;
    client: string[];
    fields: IRequestDocumentGenerateFieldsType;
    clientShortRq: string;
    clientSignature: string;
    paragraphItems?: string[];
    documentPrefixNumber: string;
    documentPrefix: string;
    documentCounter: string;
    email: IRequestDocumentGenerateEmail;
    seminarParticipantsCount: string;
    ppkApplicationData?: IPpkDocumentApplicationData;
}


export enum EnumPpkApplicationFieldCode {
    prefix = 'prefix',
    document_number = 'document_number',
    day = 'day',
    month = 'month',
    year = 'year',
    participants = 'participants',
    name_organization = 'name_organization',
    position_director = 'position_director',
    signature_director = 'signature_director',
}

export enum EnumPpkApplicationParticipantFieldCode {
    index = 'index',
    fio = 'fio',
    topic = 'topic',
    date_start = 'date_start',
    date_end = 'date_end',
}

export interface IPpkApplicationParticipant {
    [EnumPpkApplicationParticipantFieldCode.index]: string;
    [EnumPpkApplicationParticipantFieldCode.fio]: string;
    [EnumPpkApplicationParticipantFieldCode.topic]: string;
    [EnumPpkApplicationParticipantFieldCode.date_start]: string;
    [EnumPpkApplicationParticipantFieldCode.date_end]: string;
}

export interface IPpkDocumentApplicationData {
    [EnumPpkApplicationFieldCode.prefix]: string;
    [EnumPpkApplicationFieldCode.document_number]: string;
    [EnumPpkApplicationFieldCode.day]: string;
    [EnumPpkApplicationFieldCode.month]: string;
    [EnumPpkApplicationFieldCode.year]: string;
    [EnumPpkApplicationFieldCode.participants]: IPpkApplicationParticipant[];
    [EnumPpkApplicationFieldCode.name_organization]: string;
    [EnumPpkApplicationFieldCode.position_director]: string;
    [EnumPpkApplicationFieldCode.signature_director]: string;
}




export interface IRequestDocumentGenerateEmail {

    email?: string;
    needEmail?: boolean;
    name?: string;
    phone?: string;

}



export interface IRequestDocumentGenerateFieldsType {
    [key: string]: IRequestDocumentGenerateFieldValueType;
}

export interface IRequestDocumentGenerateFieldValueType {
    code: string;
    value: string | string[];
}
export enum RQ_TYPE {
    ORGANIZATION = 'org',
    BUDGET = 'org_state',
    IP = 'ip',
    FIZ = 'fiz',
    ADVOKAT = 'advokat',
}
