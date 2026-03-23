'use client';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { IBXDeal } from '@bitrix/index';
import { appActions } from '@/modules/app/model/AppSlice';
import { DealEdoCommentBitrixId } from '../../type/deal-edo-comment.type';
import { setDealEdoComment } from '../slice/DealEdoCommentSlice';


export function setupAppDealEdoCommentListener(
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
            // Получаем обновленные продукты
            const appDealDate = state.app.bitrix.deal as IBXDeal;
            const dealEdoComment = appDealDate?.[DealEdoCommentBitrixId] || '' as string;

            dispatch(
                setDealEdoComment(dealEdoComment as string),
            );
        },
    });
}
