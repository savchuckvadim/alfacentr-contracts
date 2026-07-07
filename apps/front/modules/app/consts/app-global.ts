import { IBXUser } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';
import { Placement } from '@workspace/bx';

const isProd = process.env.NEXT_PUBLIC_NODE_MODE !== 'development';
console.log('🔧 IS_PROD ', isProd);
export const IS_PROD = isProd;

export const TESTING_DOMAIN = 'alfacentr.bitrix24.ru' as string;
export const TESTING_USER = {
    ID: 502,
    ACTIVE: true,
    DATE_REGISTER: '29/08/1988',
    EMAIL: 'string',

    IS_ONLINE: 'string',
    LAST_ACTIVITY_DATE: 'string',
    LAST_LOGIN: 'string',
    LAST_NAME: '',
    NAME: 'MARINA',
    PERSONAL_BIRTHDAY: 'string',
    PERSONAL_CITY: 'string',
    PERSONAL_GENDER: 'string',
    PERSONAL_MOBILE: 'string',
    PERSONAL_PHOTO: 'string',
    PERSONAL_WWW: 'string',
    SECOND_NAME: 'string',
    TIMESTAMP_X: ['1'],
    TIME_ZONE_OFFSET: 'string',
    UF_DEPARTMENT: [1],
    UF_EMPLOYMENT_DATE: 'string',
    UF_PHONE_INNER: 'string',
    // UF_USR_1570437798556: boolean
    USER_TYPE: 'string',
    WORK_PHONE: 'string',
    WORK_POSITION: 'Оператор ТМЦ',
} as IBXUser;

// export const IS_REMEMBER_DEV = true;
export const TESTING_DEAL_ID = 170742 // 106514 // 104744; //11311
// export const TESTING_COMPANY_ID = 158587 as number; // 158479
export const DEV_CURRENT_USER_ID = 856;

export const TESTING_PLACEMENT = {
    placement: 'CRM_DEAL_DETAIL_TAB',
    options: {
        ID: TESTING_DEAL_ID,
    },
} as Placement;
