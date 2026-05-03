'use client';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { IBXDeal } from '@bitrix/index';
import { appActions } from '@/modules/app/model/AppSlice';
import { setDealEmailSubject } from '../slice/DealEmailSubjectSlice';
import { DealEmailSubjectBitrixId } from '../../type/deal-edo-comment.type';


export function setupAppDealEmailSubjectListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    // Основной listener для отслеживания изменений в products
    listenerMiddleware.startListening({
        // Слушаем любые действия, которые изменяют products
        matcher: isAnyOf(appActions.setAppData),
        effect: async (action, listenerApi) => {
            // Получаем текущее состояние
            const state = listenerApi.getState() as RootState;
            const dispatch = listenerApi.dispatch as AppDispatch;
            // Получаем тему письма из сделки

            const appDealDate = state.app.bitrix.deal as IBXDeal;
            const dealEmailSubject = appDealDate?.[DealEmailSubjectBitrixId] || '' as string;

            dispatch(
                setDealEmailSubject(dealEmailSubject as string),
            );
        },
    });
}
