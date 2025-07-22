import {
    AppDispatch,
    AppGetState,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { Bitrix } from '@bitrix/bitrix';
import { BitrixOwnerTypeId } from '@bitrix/domain';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    getDocumentHeader,
    getDocumentRqs,
} from '@/modules/features/document-rq/model/selectors/get-document-rqs.selector';
import { DocumentGenerateOwnService } from '../lib/services/document-generate-own.service';
import {
    IRequestDocumentGenerateFieldsType,
    IRequestDocumentGenerateType,
} from '@alfa/entities';
import { getDealClientType } from '@/modules/entities/deal/lib/utils/get-deal-client-type.util';
import { IDealFieldsData } from '@/modules/entities/deal/type/deal-field.type';
import { EContractType } from '@/modules/features';

import { delay } from '@/modules/shared';

// Новый стиль санков с extraArgument
export const documentGenerate = createAsyncThunk<
    boolean, // ReturnType
    void, // Arg
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>('document/generate', async (_, { dispatch, getState, extra }) => {
    // Получаем dispatch и state из деструктуризации
    const state = getState();
    const { getWSClient } = extra;

    const documentNumber = state.documentNumber;

    const dealId = state.app.bitrix.deal?.ID;
    const domain = state.app.domain;
    const socketId = getWSClient().id;
    const dealData = state.deal.dealData;
    const clientType = getDealClientType(dealData as IDealFieldsData[]);

    const contractType = state.contractType.current?.code as EContractType;

    const { client, provider } = getDocumentRqs(state);
    const header = getDocumentHeader(state);
    const { paragraph, totalSum } = state.documentParagraph;
    const clientShortRq = state.documentRq.clientShortRq;

    const generateDocumentData = {
        templateId: 118,
        entityId: dealId,
        entityTypeId: BitrixOwnerTypeId.DEAL,
        // providerClassName: 'Bitrix\\DocumentGenerator\\DataProvider\\Rest',
        value: 1,
        stampsEnabled: 1,
        values: {
            UfCrm81700582664: 'TEST',
            AlfaDocumentNumber: 'TEST',
            Header: header,
            ClientRq: client,
            ProviderRq: provider,
            Paragraph12: paragraph,
            TotalSum: totalSum,
        },
    };

    const fields = {
        UfCrm81700582664: {
            code: 'UfCrm81700582664',
            value: 'TEST',
        },
        // 'AlfaDocumentNumber': {
        //     code: 'AlfaDocumentNumber',
        //     value: 'TEST'
        // },
        Header: {
            code: 'Header',
            value: header,
        },
        ClientRq: {
            code: 'ClientRq',
            value: client,
        },
        Paragraph12: {
            code: 'Paragraph12',
            value: paragraph,
        },
        TotalSum: {
            code: 'TotalSum',
            value: totalSum,
        },
        ProviderRq: {
            code: 'ProviderRq',
            value: provider,
        },
        DocumentNumber: {
            code: 'DocumentNumber',
            value: documentNumber.prefix + '-' + documentNumber.counter,
        },
        DocumentPrefix: {
            code: 'DocumentPrefix',
            value: documentNumber.prefix,
        },
        DocumentCounter: {
            code: 'DocumentCounter',
            value: `${documentNumber.counter}`,
        },
        ClientType: {
            code: 'ClientType',
            value: clientType,
        },
        ContractType: {
            code: 'ContractType',
            value: contractType,
        },
    } as IRequestDocumentGenerateFieldsType;
    const service = new DocumentGenerateOwnService();

    const response = await service.push({
        domain,
        socketId: socketId || '',
        clientType: clientType,
        contractType: contractType,
        dealId: dealId,
        header: header,
        paragraph: paragraph,
        totalSum: totalSum,
        client: client || [],
        fields,
        clientShortRq
    } as IRequestDocumentGenerateType);

    debugger
    await delay(2000);

    const redirectLink = `https://alfacentr.bitrix24.ru/crm/deal/details/${dealId}/`;
    window &&
        window.top &&
        window.top.location.replace(redirectLink)


    // // Редирект на страницу с документом
    // if (typeof window !== 'undefined') {
    //     window.location.href = `https://alfacentr.bitrix24.ru/crm/deal/details/${dealId}/`;
    // }
    //for dev
    //     window.open(
    //         `https://alfacentr.bitrix24.ru/crm/deal/details/${dealId}/`,
    //         '_blank',
    //     );
    // }

    return true;
});

export const documentBxGenerate = createAsyncThunk<
    number, // ReturnType
    void, // Arg
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>('document/bxGenerate', async (_, { dispatch, getState, extra }) => {
    // Получаем dispatch и state из деструктуризации
    const state = getState();
    const { getWSClient } = extra;

    const dealId = state.app.bitrix.deal?.ID;

    const bitrix = Bitrix.getService();
    const { client, provider } = getDocumentRqs(state);
    const header = getDocumentHeader(state);
    const { paragraph, totalSum } = state.documentParagraph;

    const generateDocumentData = {
        templateId: 118,
        entityId: dealId,
        entityTypeId: BitrixOwnerTypeId.DEAL,
        // providerClassName: 'Bitrix\\DocumentGenerator\\DataProvider\\Rest',
        value: 1,
        stampsEnabled: 1,
        values: {
            UfCrm81700582664: 'TEST',
            AlfaDocumentNumber: 'TEST',
            Header: header,
            ClientRq: client,
            ProviderRq: provider,
            Paragraph12: paragraph,
            TotalSum: totalSum,
        },
    };

    const response = await bitrix.api.call<number>(
        'crm.documentgenerator.document.add',
        generateDocumentData,
    );
    console.log('response');
    console.log(response);
    alert('documentGenerateDone');
    return response.result;
});

// Пример использования dispatch и state
export const documentGenerateWithState = createAsyncThunk<
    { success: boolean }, // ReturnType
    any, // Arg
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>(
    'document/generateWithState',
    async (payload: any, { dispatch, getState, extra }) => {
        const state = getState();
        const { getWSClient } = extra;

        // Получаем данные из состояния
        const appState = state.app;
        const participantState = state.participant;

        // Можем диспатчить другие действия
        // dispatch(someOtherAction())

        // Используем WebSocket клиент
        const wsClient = getWSClient();

        // Ваша логика здесь
        return { success: true };
    },
);

export const documentGenerateDone = createAsyncThunk<
    { success: boolean }, // ReturnType
    any, // Arg
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>(
    'document/documentGenerateDone',
    async (payload: any, { dispatch, getState, extra }) => {
        const state = getState();
        const { getWSClient } = extra;
        const data = payload;
        debugger;
        // Получаем данные из состояния
        const appState = state.app;

        // Ваша логика здесь
        return { success: true };
    },
);
// // Новый стиль санков с extraArgument
// export const documentGenerate = createAsyncThunk<
//     number, // ReturnType
//     void, // Arg
//     {
//         dispatch: AppDispatch
//         state: RootState
//         extra: ThunkExtraArgument
//     }
// >('document/generate',
//     async (_, { dispatch, getState, extra }) => {
//         // Получаем dispatch и state из деструктуризации
//         const state = getState()
//         const { getWSClient } = extra

//         const dealId = state.app.bitrix.deal?.ID

//         const bitrix = Bitrix.getService()
//         const { client, provider } = getDocumentRqs(state)
//         const header = getDocumentHeader(state)
//         const { paragraph, totalSum } = state.documentParagraph

//         const generateDocumentData = {
//             templateId: 118,
//             entityId: dealId,
//             entityTypeId: BitrixOwnerTypeId.DEAL,
//             // providerClassName: 'Bitrix\\DocumentGenerator\\DataProvider\\Rest',
//             value: 1,
//             stampsEnabled: 1,
//             values: {
//                 'UfCrm81700582664': 'TEST',
//                 'AlfaDocumentNumber': 'TEST',
//                 'Header': header,
//                 'ClientRq': client,
//                 'ProviderRq': provider,
//                 'Paragraph12': paragraph,
//                 'TotalSum': totalSum
//             }
//         }

//         const response = await bitrix.api.call<number>('crm.documentgenerator.document.add', generateDocumentData)

//         return response.result
//     })

// // Пример использования dispatch и state
// export const documentGenerateWithState = createAsyncThunk<
//     { success: boolean }, // ReturnType
//     any, // Arg
//     {
//         dispatch: AppDispatch
//         state: RootState
//         extra: ThunkExtraArgument
//     }
// >('document/generateWithState',
//     async (payload: any, { dispatch, getState, extra }) => {
//         const state = getState()
//         const { getWSClient } = extra

//         // Получаем данные из состояния
//         const appState = state.app
//         const participantState = state.participant

//         // Можем диспатчить другие действия
//         // dispatch(someOtherAction())

//         // Используем WebSocket клиент
//         const wsClient = getWSClient()

//         // Ваша логика здесь
//         return { success: true }
//     })
