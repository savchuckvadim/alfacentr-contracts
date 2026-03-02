'use client';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { setFetchedProducts } from '@/modules/entities/product/model/ProductSlice';
import { fetchProducts } from '@/modules/entities/product/model/ProductThunk';
import type { RootState } from '@/modules/app/model/store';
import { setCurrentContractType } from '../slice/ContractTypeSlice';

// Создаем listener middleware
// export const contractTypeListener = createListenerMiddleware();
export function setupContractTypeListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    // Основной listener для отслеживания изменений в products
    listenerMiddleware.startListening({
        // Слушаем любые действия, которые изменяют products
        matcher: isAnyOf(
            // setProducts,
            setFetchedProducts,
            fetchProducts.fulfilled,
        ),
        effect: async (action, listenerApi) => {
            // Получаем текущее состояние
            const state = listenerApi.getState() as RootState;

            // Получаем обновленные продукты
            const products = state.product.items;

            listenerApi.dispatch(setCurrentContractType({ products }));
        },
    });
}
