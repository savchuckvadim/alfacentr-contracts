'use client';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { documentNumberSliceActions } from '@/modules/features/document-number';
import { getDealSubject } from '../../lib/utils/get-deal-subject.util';
import { setDealEmailSubject } from '../slice/DealEmailSubjectSlice';
import { updateOnlyBitrixDealField } from '@/modules/entities/deal/model/DealThunk';
import { DealEmailSubjectBitrixId } from '../../type/deal-edo-comment.type';

export function setupDocumentNumberDealEmailSubjectListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    // Основной listener для отслеживания изменений в products
    listenerMiddleware.startListening({
        // Слушаем любые действия, которые изменяют products
        matcher: isAnyOf(documentNumberSliceActions.setDocumentNumber),
        effect: async (action, listenerApi) => {

            // Получаем текущее состояние
            const state = listenerApi.getState() as RootState;
            const dispatch = listenerApi.dispatch as AppDispatch;
            // Получаем тему письма из state
            const currentSubject = state.dealEmailSubject.value;
            const prefix = state.documentNumber.prefix;
            const counter = state.documentNumber.counter;
            const newSubject = getDealSubject(prefix, counter);
            const isNeedUpdate = currentSubject !== newSubject;
            
            if (isNeedUpdate && newSubject) {
                dispatch(
                    setDealEmailSubject(newSubject),
                );
                dispatch(
                    updateOnlyBitrixDealField({
                        fieldBitrixId: DealEmailSubjectBitrixId,
                        value: newSubject
                    })
                )

            }
        },
    });
}
