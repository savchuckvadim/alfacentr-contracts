import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    getDocumentHeader,
    getDocumentRqs,
} from '@/modules/features/document-rq/model/selectors/get-document-rqs.selector';
import { DocumentGenerateOwnService } from '../lib/services/document-generate-own.service';
import {
    DocumentGenerateFieldTemplateCode,
    IRequestDocumentGenerateFieldsType,
    IRequestDocumentGenerateType,
    BxDealDataKeys,
} from '@alfa/entities';
import { getDealClientType } from '@/modules/entities/deal/lib/utils/get-deal-client-type.util';
import { IDealFieldsData } from '@/modules/entities/deal/type/deal-field.type';
import { EContractType } from '@/modules/features';

import { delay } from '@/modules/shared';
import { reloadApp } from '@/modules/app/model/AppThunk';

import { communicationsActions } from '@/modules/features/communications/model/slice/CommunicationsSlice';
import { IS_PROD } from '@/modules/app/consts/app-global';
import { getDocumentPpkApplicationData } from '../lib/utils/document-participant.util';
import { errorHandler } from '@/modules/app/lib/error-handler';

const formatActDateForDocument = (raw: string): string => {
    if (!raw) return '';

    // Canonical format in store: YYYY-MM-DD
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return raw;

    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

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

    const { needEmail, isConfirmed } = state.communications.confirm;

    if (!isConfirmed) {
        dispatch(communicationsActions.setConfirmCommunicationsActive(true));
        return false;
    }
    dispatch(communicationsActions.setConfirmCommunicationsActive(false));
    dispatch(communicationsActions.setEmailConfirmConfirmed(false));
    const { getWSClient } = extra;

    const documentNumber = state.documentNumber;
    const domain = state.app.domain;
    const dealId = state.app.bitrix.deal?.ID;
    const user = state.app.bitrix.user;
    const userId = Number(user?.ID) || 502;
    let userName = user?.NAME || 'Менеджер';
    if (user?.LAST_NAME && user?.SECOND_NAME) {
        userName = `${user?.LAST_NAME} ${user?.NAME} ${user?.SECOND_NAME}`;
    } else if (user?.LAST_NAME) {
        userName = `${user?.LAST_NAME} ${user?.NAME}`;
    }

    const userEmail = 'nmbrsdntl@gmail.com'; // 'ppk@alfasibir.ru';

    const socketId = getWSClient().id;
    const actDateRaw = (state.dealActDate.dealActDate || '') as string;
    const actDate = formatActDateForDocument(actDateRaw);


    const dealData = state.deal.dealData;
    const clientType = getDealClientType(dealData as IDealFieldsData[]);

    const contractType = state.contractType.current?.code as EContractType;

    const { client } = getDocumentRqs(state);

    const header = getDocumentHeader(state);
    const { paragraph, totalSum, paragraphItems } = state.documentParagraph;

    const {
        clientShortRq,
        clientSignature,
        clientCompanyTitle,
        clientDirectorInitials,
        clientUpdAddress,
        clientUpdShortRq,
        clientCompanyShortTitle,
        clientUpdInnKpp,
    } = state.documentRq;
    const companyName = state.app.bitrix.company?.TITLE || clientCompanyTitle || '__';
    const companyId = Number(state.app.bitrix.company?.ID) || 0;

    const products = state.product.items;
    const productsCount = products.length;
    const edoComment = state.dealEdoComment.value || '';

    const phone = state.deal.dealData?.find(
        field => field.code === BxDealDataKeys.exchange_doc_phone,
    )?.value;
    const email = state.deal.dealData?.find(
        field => field.code === BxDealDataKeys.exchange_doc_email,
    )?.value;
    const name = state.deal.dealData?.find(
        field => field.code === BxDealDataKeys.exchange_doc_name,
    )?.value;

    const fields = {
        UfCrm81700582664: {
            code: 'UfCrm81700582664',
            value: 'TEST',
        },

        Header: {
            code: DocumentGenerateFieldTemplateCode.Header,
            value: header,
        },
        ClientRq: {
            code: DocumentGenerateFieldTemplateCode.ClientRq,
            value: client,
        },
        Paragraph12: {
            code: DocumentGenerateFieldTemplateCode.Paragraph12,
            value: paragraph,
        },

        DocumentNumber: {
            code: DocumentGenerateFieldTemplateCode.DocumentPrefixNumber,
            value: documentNumber.prefix + '-' + documentNumber.counter,
        },
    } as IRequestDocumentGenerateFieldsType;
    const service = new DocumentGenerateOwnService();

    const ppkApplicationData =
        contractType === EContractType.seminar_ppk ||
            contractType === EContractType.ppk
            ? getDocumentPpkApplicationData({
                documentPrefix: documentNumber.prefix,
                documentCounter: documentNumber.counter.toString(),
                participants: state.participantProduct.ppkDistribution,
                name_organization: clientCompanyTitle,
                position_director: clientDirectorInitials,
                signature_director: clientSignature,
            })
            : undefined;


    try {
        const sendData = {
            domain,
            userId,
            userName,
            userEmail,
            socketId: socketId || '',
            clientType: clientType,
            contractType: contractType,
            dealId: dealId,
            companyName,
            companyId,
            header: header,
            paragraph: paragraph,
            totalSum: totalSum,
            client: client || [],
            fields,
            actDate,
            clientShortRq,
            clientSignature,
            clientCompanyTitle,
            clientDirectorInitials,
            clientUpdAddress,
            clientUpdShortRq,
            clientCompanyShortTitle,
            paragraphItems,
            documentPrefixNumber:
                documentNumber.prefix + '-' + documentNumber.counter,
            documentPrefix: documentNumber.prefix,
            documentCounter: documentNumber.counter.toString(),
            clientUpdInnKpp,
            email: {
                needEmail,
                email,
                phone,
                name,
            },
            seminarParticipantsCount: `${productsCount}`,
            ppkApplicationData,
            edoComment,

        } as IRequestDocumentGenerateType;

        const response = await service.push(sendData);
    } catch (error) {
        // Используем централизованную обработку ошибок
        const errorMessage =
            error instanceof Error
                ? error.message
                : `Ошибка генерации документа: ${String(error)}`;

        // Создаем критическую ошибку, которая автоматически покажет ErrorPage
        errorHandler.createCriticalError(errorMessage);

        // Пробрасываем ошибку дальше, чтобы thunk был отклонен
        throw error;
    }

    await delay(5000);

    const redirectLink = `https://alfacentr.bitrix24.ru/crm/deal/details/${dealId}/`;
    IS_PROD
        ? window && window.top && window.top.location.replace(redirectLink)
        : dispatch(reloadApp());

    return true;
});

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
        const dealId = state.app.bitrix.deal?.ID;
        console.log(dealId);
        // const { getWSClient } = extra;
        // const data = payload;

        // Получаем данные из состояния
        // const appState = state.app;

        // Ваша логика здесь
        return { success: true };
    },
);
