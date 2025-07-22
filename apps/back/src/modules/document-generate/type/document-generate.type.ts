// export enum EContractType {
//     seminar = 'seminar',
//     ppk = 'ppk',
//     seminar_ppk = 'seminar_ppk',
//     up = 'up'
// }
// export enum EContractName {
//     seminar = 'Семинар',
//     ppk = 'ППК',
//     seminar_ppk = 'Семинар ППК',
//     up = 'УП'
// }

// export const DocumentGenerateTemplatesType = {
//     SEMINAR_PPK_DEAL: {
//         id: 134,
//         name: 'Договор Семинар ППК СДЕЛКА',
//         code: 'ContractSeminarPPKDeal',
//         fields: [
//             {
//                 name: 'Client',

//                 code: 'Client',
//                 templateCode: 'Client',
//                 type: 'string',
//             },
//         ],
//         forContract: [
//             EContractType.seminar_ppk,
//         ] as EContractType[],

//     } as const,
//     INVOISE_WITH_STAMPS: {
//         id: 136,
//         name: 'Счет с печатью СЕМИНАРЫ СДЕЛКА',
//         code: 'InvoiceWithStamps',
//         fields: [
//             {
//                 name: 'Реквизиты для счета',
//                 code: 'InvoiceRq',
//                 templateCode: 'InvoiceRq',
//                 type: 'string',
//             },

//         ],
//         forContract: [
//             EContractType.seminar,
//             EContractType.seminar_ppk,
//             EContractType.ppk,
//             EContractType.up,
//         ] as EContractType[],

//     } as const,
//     INVOISE_WITHOUT_STAMPS: {
//         id: 137,
//         name: 'Счет без печати СЕМИНАРЫ СДЕЛКА',
//         code: 'InvoiceWithoutStamps',
//         fields: [{
//             name: 'Реквизиты для счета',
//             code: 'InvoiceRq',
//             templateCode: 'InvoiceRq',
//             type: 'string',
//         }
//         ],
//         forContract: [
//             EContractType.seminar,
//             EContractType.seminar_ppk,
//             EContractType.ppk,
//             EContractType.up,
//         ] as EContractType[],
//     } as const,

// }

// export type DocumentGenerateType = typeof DocumentGenerateTemplatesType;
