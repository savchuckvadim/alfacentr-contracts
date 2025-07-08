import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { setProducts, setFetchedProducts } from '@/modules/entities/product/model/ProductSlice';
import { fetchProducts } from '@/modules/entities/product/model/ProductThunk';
import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { setCurrentContractType } from '../ContractTypeSlice';

// Создаем listener middleware
export const contractTypeListener = createListenerMiddleware();

// Основной listener для отслеживания изменений в products
contractTypeListener.startListening({
  // Слушаем любые действия, которые изменяют products
  matcher: isAnyOf(setProducts, setFetchedProducts, fetchProducts.fulfilled),
  effect: async (action, listenerApi) => {
    // Получаем текущее состояние
    const state = listenerApi.getState() as RootState;
    
    // Получаем обновленные продукты
    const products = state.product.items;
    
    console.log('Products updated:', {
      action: action.type,
      productsCount: products.length,
      products: products
    });
    debugger;
    listenerApi.dispatch(setCurrentContractType({products}));
    // Здесь можно добавить вашу логику для обработки обновлений
    // Например:
    // - Обновление связанных данных
    // - Отправка уведомлений
    // - Синхронизация с другими частями приложения
    // - Логирование изменений
    
    // Пример: если нужно выполнить дополнительную логику
    if (products.length > 0) {
      // Обработка обновленных продуктов
      console.log(`Updated ${products.length} products`);
      
      // Можно диспатчить дополнительные действия
      // listenerApi.dispatch(someOtherAction());
    }
  },
});

// Альтернативный listener - слушает изменения состояния напрямую
// Этот способ работает независимо от того, как именно обновляется состояние
contractTypeListener.startListening({
  // Слушаем любые изменения в состоянии products
  predicate: (action, currentState, previousState) => {
    const currentProducts = (currentState as RootState).product.items;
    const previousProducts = (previousState as RootState).product.items;
    
    // Проверяем, изменились ли продукты (сравниваем по длине и содержимому)
    return currentProducts.length !== previousProducts.length || 
           JSON.stringify(currentProducts) !== JSON.stringify(previousProducts);
  },
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const products = state.product.items;
    
    console.log('Products state changed (predicate):', {
      action: action.type,
      productsCount: products.length,
      products: products
    });
    
    // Ваша логика здесь
  },
});

export default contractTypeListener;


