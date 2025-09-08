// export enum EnumPpkApplicationFieldCode {
//     prefix = 'prefix',
//     document_number = 'document_number',
//     day = 'day',
//     month = 'month',
//     year = 'year',
//     participants = 'participants',
//     name_organization = 'name_organization',
//     position_director = 'position_director',
//     signature_director = 'signature_director',
// }

// export enum EnumPpkApplicationParticipantFieldCode {
//     index = 'index',
//     fio = 'fio',
//     topic = 'topic',
//     date_start = 'date_start',
//     date_end = 'date_end',
// }

// export interface IPpkApplicationParticipant {
//     [EnumPpkApplicationParticipantFieldCode.index]: string;
//     [EnumPpkApplicationParticipantFieldCode.fio]: string;
//     [EnumPpkApplicationParticipantFieldCode.topic]: string;
//     [EnumPpkApplicationParticipantFieldCode.date_start]: string;
//     [EnumPpkApplicationParticipantFieldCode.date_end]: string;
// }

// export interface IPpkDocumentApplicationData {
//     [EnumPpkApplicationFieldCode.prefix]: string;
//     [EnumPpkApplicationFieldCode.document_number]: string;
//     [EnumPpkApplicationFieldCode.day]: string;
//     [EnumPpkApplicationFieldCode.month]: string;
//     [EnumPpkApplicationFieldCode.year]: string;
//     [EnumPpkApplicationFieldCode.participants]: IPpkApplicationParticipant[];
//     [EnumPpkApplicationFieldCode.name_organization]: string;
//     [EnumPpkApplicationFieldCode.position_director]: string;
//     [EnumPpkApplicationFieldCode.signature_director]: string;
// }
