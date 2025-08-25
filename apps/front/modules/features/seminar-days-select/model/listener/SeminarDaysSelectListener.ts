'use client';
import { RootState } from '@/modules/app/model/store';
import {
    addParticipant,
    deleteParticipant,
    fetchParticipants,
    fetchProducts,
    getProductFieldByCodeValue,
    getProductTypeByProductName,
    setFetchedProducts,
    setParticipants,
    updateParticipant,
} from '@/modules/entities';
import { BxParticipantsDataKeys } from '@alfa/entities';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { setSeminarDays } from '../slice/SeminarDaysSelectSlice';

import { getSortedDays } from '../../lib/utils/days-sort.util';

// export const participantProductListener = createListenerMiddleware();
export function setupParticipantSeminarDaysListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    // Основной listener для отслеживания изменений в products
    listenerMiddleware.startListening({
        // Слушаем любые действия, которые изменяют products
        matcher: isAnyOf(
            // setProducts,
            setFetchedProducts,
            fetchProducts.fulfilled,
            setParticipants,

            fetchParticipants.fulfilled,
            updateParticipant.fulfilled,
            addParticipant.fulfilled,
            deleteParticipant.fulfilled,
        ),
        effect: async (action, listenerApi) => {
            // Получаем текущее состояние
            const state = listenerApi.getState() as RootState;
            const dispatch = listenerApi.dispatch;
            // Получаем обновленные продукты
            const products = state.product.items;
            const participants = state.participant.items;
            const allDays = {} as Record<string, string[]>;
            participants.forEach(participant => {
                participant.fields.forEach(field => {
                    if (field.code === BxParticipantsDataKeys.days) {
                        if (field.value && field.value.length) {
                            (field.value as string[]).forEach((day: string) => {
                                if (!allDays[day]) {
                                    allDays[day] = [];
                                }
                            });
                        }
                    }
                });
            });

            products.forEach((product, index) => {
                const productType = getProductTypeByProductName(
                    product.productName || '',
                );
                if (productType === 'seminar') {
                    const day = getProductFieldByCodeValue(
                        product,
                        'NAME_BID',
                    )?.value;
                    if (day) {
                        if (!allDays[day]) {
                            allDays[day] = [index.toString()];
                        } else {
                            allDays[day].push(index.toString());
                        }
                    }
                }
            });

            dispatch(setSeminarDays(getSortedDays(Object.keys(allDays))));
        },
    });
}
