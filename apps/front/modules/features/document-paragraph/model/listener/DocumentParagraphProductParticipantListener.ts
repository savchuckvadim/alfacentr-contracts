'use client';
import { RootState } from '@/modules/app/model/store';
import {
    addParticipant,
    deleteParticipant,
    fetchParticipants,
    fetchProducts,
    getProductFieldByCodeValue,
    getProductSum,
    setFetchedProducts,
    setParticipants,
    updateParticipant,
} from '@/modules/entities';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';

import { getProductsByType } from '@/modules/features/participant-product/lib/utils/product.util';
import { IAlfaProduct } from '@/modules/entities/product/model/ProductSlice';
import { setParagraph, setTotalSum } from '../slice/DocumentParagraphSlice';
import { formatRuble } from '@/modules/lib';

// export const documentParagraphProductParticipantListener = createListenerMiddleware();
export function setupDocumentParagraphProductParticipantListener(
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

            // Получаем обновленные продукты
            const products = state.product.items;
            const participants = state.participant.items;

            let result = '';
            let totalSum = '';
            if (products.length > 0) {
                // Обработка обновленных продуктов
                result = 'Пункт 1.1.2 \n Консультационном семинаре ';
                const searchedSeminarProducts = getProductsByType(
                    products,
                    'seminar',
                );
                if (
                    searchedSeminarProducts &&
                    searchedSeminarProducts.length > 0
                ) {
                    const seminarNameVallue = getProductFieldByCodeValue(
                        searchedSeminarProducts[0] as IAlfaProduct,
                        'NAME_BID',
                    );
                    result += seminarNameVallue?.value + '\n';

                    const seminarDateVallue = getProductFieldByCodeValue(
                        searchedSeminarProducts[0] as IAlfaProduct,
                        'SEMINAR_START_AND_END_DATE',
                    );
                    result += seminarDateVallue?.value + '\n';
                    const seminarPlaceVallue = getProductFieldByCodeValue(
                        searchedSeminarProducts[0] as IAlfaProduct,
                        'SEMINAR_PLACE',
                    );
                    result += seminarPlaceVallue?.value + '\n';
                    let participantsQuantity = 1;

                    if (participants && participants.length > 0) {
                        participantsQuantity =
                            searchedSeminarProducts[0]?.quantity || 1;
                    }
                    result += `Количество участников: ${participantsQuantity} \n`;
                    const productsSum = getProductSum(products);

                    totalSum = `Общая стоимость услуг по Договору составляет ${formatRuble(productsSum)} рублей. \n`;
                }

                // Можно диспатчить дополнительные действия
                // listenerApi.dispatch(setParticipantPpk(serializedResult));
            }
            listenerApi.dispatch(setParagraph(result));
            listenerApi.dispatch(setTotalSum(totalSum));
        },
    });
}
