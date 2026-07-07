import { API_METHOD } from '../type/type';
import axios, { AxiosError, AxiosResponse } from 'axios';
//
const prod = 'https://alfacentr.back.april-app.ru/api/';
// const prod = `http://localhost:3000/api/`;
// const prod = `http://localhost:8200/api/`;
const url = prod;

export enum EBACK_ENDPOINT {
    DEPARTMENT = 'bitrix/department/sales',
    DOCUMENT_GENERATE = 'document-generate',
    DOCUMENT_IS_DEAL_READY_FOR_SEND = 'document-generate/is-deal-ready-for-send',

    QUEUE_PING = 'queue/ping',

    BITRIX_METHOD = 'helper/bitrix/method',

    ALFA_DEAL_PRODUCTS = 'alfa-deal-products',
    DOCUMENT_NUMBER = 'document-number/by-prefix',
    VALIDATE_CHECK_EMAIL = 'validate-check/email',
    VALIDATE_CHECK_PHONE = 'validate-check/phone',

    SEMINAR_GET_FIELDS_DATA = 'seminar/get-fields-data',
    SEMINAR_GET_DEAL_VALUES = 'seminar/get-deal-values',
}

export interface IBackResponse<T> {
    resultCode: EResultCode; // 0 - успех, 1 - ошибка
    data?: T; // данные ответа (при успехе)
    message?: string; // сообщение ошибки (при ошибке)
    errors?: string[]; // ошибки (при ошибке)
}
export enum EResultCode {
    SUCCESS = 0,
    ERROR = 1,
}

const evsHeaders = {
    'content-type': 'application/json',
    'X-BACK-API-KEY': '',
};

const evs = axios.create({
    baseURL: url,
    withCredentials: true,
    headers: evsHeaders,
});
export const backAPI = {
    service: async <T>(
        url: EBACK_ENDPOINT,
        method: API_METHOD,
        data: any,
        query?: string,
    ): Promise<IBackResponse<T>> => {
        let response = null as null | IBackResponse<T>;

        try {
            const headers =
                data instanceof FormData
                    ? { 'Content-Type': 'multipart/form-data' }
                    : { 'Content-Type': 'application/json' };

            const endoint = !query ? url : `${url}/${query}`;

            const axiosResponse = await evs[method](endoint, data, {
                ...evsHeaders,
                headers,
            });

            response = axiosResponse.data as IBackResponse<T>;
        } catch (error: unknown) {
            console.error('API error', error);

            return (error as AxiosError<IBackResponse<T>>).response
                ?.data as IBackResponse<T>;

            // return {
            //     resultCode: EResultCode.ERROR,
            //     message: 'Request failed',
            // } as IBackResponse<T>;
        }

        return response;
    },

    download: async <Blob>(
        url: EBACK_ENDPOINT,
        method: API_METHOD,
        data: any,
    ): Promise<Blob> => {
        try {
            const result = (await evs[method](url, data, {
                headers: evsHeaders,
                responseType: 'blob',
            })) as AxiosResponse<Blob>;

            return result.data;
        } catch (error) {
            console.error('API error', error);
            return null as Blob;
        }
    },
};
