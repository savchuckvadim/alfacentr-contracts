// import { createListenerMiddleware, isAnyOf, createAction } from '@reduxjs/toolkit';
// import { setProducts, setFetchedProducts } from '@/modules/entities/product/model/ProductSlice';
// import { fetchProducts } from '@/modules/entities/product/model/ProductThunk';
// import type { RootState } from '@/modules/app/model/store';

// // Пример 1: Слушать конкретные действия
// export const productActionListener = createListenerMiddleware();

// productActionListener.startListening({
//   // Слушаем только успешную загрузку продуктов
//   actionCreator: setFetchedProducts,
//   effect: async (action, listenerApi) => {
//     const products = action.payload;
//     console.log('Products fetched successfully:', products);

//     // Логика после успешной загрузки
//   },
// });

// // Пример 2: Слушать изменения состояния с помощью predicate
// export const productStateListener = createListenerMiddleware();

// productStateListener.startListening({
//   // Слушаем любые изменения в состоянии products
//   predicate: (action, currentState, previousState) => {
//     const currentProducts = (currentState as RootState).product.items;
//     const previousProducts = (previousState as RootState).product.items;

//     // Проверяем, изменились ли продукты
//     return currentProducts !== previousProducts;
//   },
//   effect: async (action, listenerApi) => {
//     const state = listenerApi.getState() as RootState;
//     const products = state.product.items;

//     console.log('Products state changed:', {
//       action: action.type,
//       productsCount: products.length
//     });
//   },
// });

// // Пример 3: Слушать несколько действий одновременно (включая thunk)
// export const productMultiActionListener = createListenerMiddleware();

// productMultiActionListener.startListening({
//   // Слушаем несколько действий, включая thunk
//   matcher: isAnyOf(setProducts, setFetchedProducts, fetchProducts.fulfilled),
//   effect: async (action, listenerApi) => {
//     const state = listenerApi.getState() as RootState;
//     const products = state.product.items;

//     console.log(`Products updated via ${action.type}:`, products);
//   },
// });

// // Пример 4: Слушать с условием (включая thunk)
// export const productConditionalListener = createListenerMiddleware();

// productConditionalListener.startListening({
//   matcher: isAnyOf(setProducts, setFetchedProducts, fetchProducts.fulfilled),
//   effect: async (action, listenerApi) => {
//     const state = listenerApi.getState() as RootState;
//     const products = state.product.items;

//     // Выполняем логику только если есть продукты
//     if (products.length > 0) {
//       console.log('Products available:', products.length);

//       // Можно диспатчить дополнительные действия
//       // listenerApi.dispatch(someOtherAction());
//     }
//   },
// });

// // Пример 5: Слушать с задержкой (debounce)
// export const productDebounceListener = createListenerMiddleware();

// productDebounceListener.startListening({
//   matcher: isAnyOf(setProducts, setFetchedProducts),
//   effect: async (action, listenerApi) => {
//     // Ждем 500мс перед выполнением логики
//     await listenerApi.delay(500);

//     const state = listenerApi.getState() as RootState;
//     const products = state.product.items;

//     console.log('Products updated (debounced):', products);
//   },
// });

// // Пример 6: Слушать с отменой предыдущих вызовов
// export const productCancelableListener = createListenerMiddleware();

// productCancelableListener.startListening({
//   matcher: isAnyOf(setProducts, setFetchedProducts),
//   effect: async (action, listenerApi) => {
//     // Отменяем предыдущие вызовы этого listener
//     listenerApi.cancelActiveListeners();

//     const state = listenerApi.getState() as RootState;
//     const products = state.product.items;

//     console.log('Products updated (canceled previous):', products);
//   },
// });

// // Пример 7: Слушать с получением предыдущего состояния
// export const productPreviousStateListener = createListenerMiddleware();

// productPreviousStateListener.startListening({
//   matcher: isAnyOf(setProducts, setFetchedProducts),
//   effect: async (action, listenerApi) => {
//     const state = listenerApi.getState() as RootState;
//     const currentProducts = state.product.items;

//     // Получаем предыдущее состояние
//     const previousState = listenerApi.getOriginalState() as RootState;
//     const previousProducts = previousState.product.items;

//     console.log('Products changed:', {
//       previous: previousProducts.length,
//       current: currentProducts.length,
//       difference: currentProducts.length - previousProducts.length
//     });
//   },
// });

// // Пример 8: Слушать с отправкой дополнительных действий
// export const productActionDispatcherListener = createListenerMiddleware();

// // Создаем дополнительное действие
// const productsUpdated = createAction('products/updated');

// productActionDispatcherListener.startListening({
//   matcher: isAnyOf(setProducts, setFetchedProducts),
//   effect: async (action, listenerApi) => {
//     const state = listenerApi.getState() as RootState;
//     const products = state.product.items;

//     console.log('Products updated, dispatching additional action');

//     // Отправляем дополнительное действие
//     listenerApi.dispatch(productsUpdated());
//   },
// });

// // Экспортируем все listeners
// export const allProductListeners = [
//   productActionListener,
//   productStateListener,
//   productMultiActionListener,
//   productConditionalListener,
//   productDebounceListener,
//   productCancelableListener,
//   productPreviousStateListener,
//   productActionDispatcherListener,
// ];
