
const alfaBank = {
    name:'АЛЬФА-БАНК',
    bankName:'ФИЛИАЛ "НОВОСИБИРСКИЙ"  АО "АЛЬФА-БАНК"',
    bik:'045004774',
    rs:'40702810923400000075',
    ks:'30101810600000000774',
    bankAddress:'г. Новосибирск',
    code:'alfa',
    // other: 'ОГРН 1145476103915, ОКПО 35567393,ОКАТО 50401377000,ОКТМО 50701000001,ОКОГУ 4210014,ОКФС 16,ОКОПФ 12165,ОКВЭД 72.4',
} as const ;

const point39Bank = {
    name:'Банк Точка 39',
    bankName:'ООО "Банк Точка"',
    bik:'044525104',
    rs:'40702810304500003639',
    ks:'30101810745374525104',
    bankAddress:'г. Москва',
    code:'point39',
} as const ;

const sberBank = {
    name:'СБЕРБАНК',
    bankName:'СИБИРСКИЙ БАНК ПАО СБЕРБАНК',
    bik:'045004641',
    rs:'40702810644050047009',
    ks:'30101810500000000641',
    bankAddress:'г. Москва',
    code:'sber',
} as const ;

const point36Bank = {
    name:'Банк Точка 8836',
    bankName:'ООО "Банк Точка"',
    bik:'044525104',
    rs:'40702810704500008836',
    ks:'30101810745374525104',
    bankAddress:'г. Москва',
    code:'point36',
} as const ;

// const aceptBank = {
//     name:'Банк Акцепт',
//     bankName:'АО "БАНК АКЦЕПТ",',
//     bik:'045004815',
//     rs:'40702810200800005564',
//     ks:'30101810200000000815',
//     bankAddress:'г. Новосибирск',
//     code:'acept',
// } as const ;
// UF_CRM_8_BANK
export const ALFA_RQ_DATA = {
    alfa: alfaBank,
    point39: point39Bank,
    sber: sberBank,
    point36: point36Bank,
    // acept: aceptBank,
} as const ;




