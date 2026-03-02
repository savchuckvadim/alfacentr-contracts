'use client';
import { RootState } from '@/modules/app/model/store';
import {
    addParticipant,
    deleteParticipant,
    fetchParticipants,
    fetchProducts,
    getProductFieldByCodeValue,
    getProductSum,
    getProductTax,
    getProductTaxSum,
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
            const paragraphItems: string[] = [];
            if (products.length > 0) {
                // Обработка обновленных продуктов

                const searchedSeminarProducts = getProductsByType(
                    products,
                    'seminar',
                );
                if (
                    searchedSeminarProducts &&
                    searchedSeminarProducts.length > 0
                ) {
                    result =
                        searchedSeminarProducts.length > 1
                            ? 'Пункты 1.1.2 Консультационных семинарах  \n '
                            : 'Пункт 1.1.2 Консультационном семинаре  \n  ';

                    searchedSeminarProducts.forEach(product => {
                        let itemResult = '';

                        const seminarNameVallue = getProductFieldByCodeValue(
                            product as IAlfaProduct,
                            'SEMINAR_TOPIC',
                        );
                        if (seminarNameVallue && seminarNameVallue.value) {
                            result += seminarNameVallue?.value + '\n';
                            itemResult += seminarNameVallue?.value;
                        } else {
                            result +=
                                'Тема семинара: __________________________________\n';
                            itemResult +=
                                ',  Тема семинара: __________________________________';
                        }

                        const seminarDateVallue = getProductFieldByCodeValue(
                            product as IAlfaProduct,
                            'SEMINAR_START_AND_END_DATE',
                        );
                        if (seminarDateVallue && seminarDateVallue.value) {
                            result += seminarDateVallue?.value + '\n';
                            itemResult += ',  ' + seminarDateVallue?.value;
                        } else {
                            result +=
                                'Дата проведения: __________________________________\n';
                            itemResult +=
                                ',  Дата проведения: __________________________________';
                        }

                        const seminarPlaceVallue = getProductFieldByCodeValue(
                            product as IAlfaProduct,
                            'SEMINAR_PLACE',
                        );
                        if (seminarPlaceVallue && seminarPlaceVallue.value) {
                            result += seminarPlaceVallue?.value + '\n';
                            itemResult += ',  ' + seminarPlaceVallue?.value;
                        } else {
                            result +=
                                'Место проведения: __________________________________\n';
                            itemResult +=
                                ',  Место проведения: __________________________________';
                        }

                        let participantsQuantity = 1;

                        if (participants && participants.length > 0) {
                            participantsQuantity = product.quantity || 1;
                        }
                        result += `Количество участников: ${participantsQuantity} \n`;
                        itemResult +=
                            ',  Количество участников: ' + participantsQuantity;
                        paragraphItems.push(itemResult);
                    });
                }
                const productsSum = getProductSum(products);
                const productsTax = getProductTax(products);
                const productsTaxSum = getProductTaxSum(products);

                totalSum = `Общая стоимость услуг по Договору составляет ${formatRuble(productsSum)} рублей. \n`;
                totalSum += `Общая стоимость услуг по Договору составляет ${formatRuble(productsSum)} рублей. \n`;
                totalSum += `В том числе НДС 5% ${formatRuble(productsTaxSum)} рублей. \n`;
                totalSum += `В соответствии с пп.1 п.8 ст.164 НК РФ. \n`;
                // Можно диспатчить дополнительные действия
                // listenerApi.dispatch(setParticipantPpk(serializedResult));
            }

            listenerApi.dispatch(
                setParagraph({
                    paragraph: result,
                    paragraphItems,
                }),
            );
            listenerApi.dispatch(setTotalSum(totalSum));
        },
    });
}
