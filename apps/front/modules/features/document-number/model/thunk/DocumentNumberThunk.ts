import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import {
    getCurrentDinamycPrefix,
    getCurrentDocumentNumber,
} from '@/modules/entities';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_METHOD, backAPI, EBACK_ENDPOINT } from '@workspace/api';
import { updateBxDeal } from '../../lib/bx-deal-update';
import {
    IDocumentNumberUpdateDoneResponse,
    IDocumentNumberUpdateDoneResult,
    IDocumentNumberUpdateRequest,
} from '../../type/document-number.type';
import { documentNumberSliceActions } from '../slice/DocumentNumberSlice';

export const updateDocumentNumber = createAsyncThunk<
    void,
    undefined,
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>(
    'documentNumber/update',
    async (_, { rejectWithValue, getState, extra, dispatch }) => {
        try {
            const state = getState() as RootState;
            const deal = state.app.bitrix.deal;
            const isLoading = state.documentNumber.isLoading;

            if (isLoading) {
                return;
            }
            dispatch(documentNumberSliceActions.setLoading(true));
            if (!deal) {
                return rejectWithValue('Deal not found');
            }
            const { getWSClient } = extra;
            const socketId = getWSClient().id;

            const { number, prefix } = getCurrentDocumentNumber(deal);
            const newDinamyc = getCurrentDinamycPrefix(state.product.items);
            const newDinamycPrefix = `ТЕСТ PREFIX ${newDinamyc}`;

            //если динамический префикс изменился или номер не установлен
            // отправляем запрашиваем у бэка новый номер
            // надо обновить в битрикс и в текущей сделке
            if (newDinamycPrefix !== prefix || !number || number === '0') {
                const dto = {
                    dealId: deal.ID,
                    prefix: newDinamycPrefix,
                    dinamycPrefix: newDinamycPrefix,
                    socketId,
                } as IDocumentNumberUpdateRequest;

                const response = await backAPI.service(
                    EBACK_ENDPOINT.DOCUMENT_NUMBER,
                    API_METHOD.POST,
                    dto,
                );

                return void 0;
            } else {
                dispatch(
                    documentNumberSliceActions.setDocumentNumber({
                        prefix: newDinamycPrefix,
                        counter: Number(number),
                    }),
                );
                dispatch(documentNumberSliceActions.setLoading(false));
            }
        } catch (error) {
            return rejectWithValue(error);
        }
    },
);

export const documentNumberDone = createAsyncThunk<
    IDocumentNumberUpdateDoneResult,
    IDocumentNumberUpdateDoneResponse,
    {
        dispatch: AppDispatch;
        getState: () => RootState;
        extra: ThunkExtraArgument;
    }
>(
    'documentNumber/onDone',
    async (
        response: IDocumentNumberUpdateDoneResponse,
        { rejectWithValue, getState },
    ) => {
        const data = response.data;
        try {
            console.log('🔧 documentNumberDone thunk called with data:', data);
            // надо обновить в битрикс и в текущей сделке
            const state = getState() as RootState;
            const dealId = state.app.bitrix.deal?.ID;

            if (!dealId) {
                return rejectWithValue('Deal not found');
            }

            await updateBxDeal(dealId, data.prefix, data.counter);

            return {
                prefix: data.prefix,
                counter: data.counter,
            } as IDocumentNumberUpdateDoneResult;
        } catch (error) {
            console.error('❌ Error in documentNumberDone:', error);
            return rejectWithValue(error);
        }
    },
);
