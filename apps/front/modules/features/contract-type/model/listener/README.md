# RTK Listeners для отслеживания обновлений Products

Этот модуль содержит RTK listeners для отслеживания изменений в состоянии products.

## Основной Listener

`ContractTypeListener.ts` - основной listener, который отслеживает обновления products в состоянии.

### Как использовать:

1. **Импорт listener:**
```typescript
import { contractTypeListener } from '@/modules/entities/contract-type/model/listener/ContractTypeListener';
```

2. **Подключение к store:**
```typescript
// В store.ts
import { contractTypeListener } from '@/modules/entities/contract-type/model/listener/ContractTypeListener';

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(contractTypeListener.middleware)
  });
};
```

3. **Что отслеживает:**
- `setProducts` - ручная установка продуктов
- `setFetchedProducts` - установка продуктов после загрузки
- `fetchProducts.fulfilled` - успешное выполнение thunk для загрузки продуктов

## Примеры использования

### Базовый listener (включая thunk):
```typescript
contractTypeListener.startListening({
  matcher: isAnyOf(setProducts, setFetchedProducts, fetchProducts.fulfilled),
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const products = state.product.items;
    
    console.log('Products updated:', products);
    
    // Ваша логика здесь
  },
});
```

### Слушать конкретное действие:
```typescript
contractTypeListener.startListening({
  actionCreator: setFetchedProducts,
  effect: async (action, listenerApi) => {
    const products = action.payload;
    console.log('Products fetched:', products);
  },
});
```

### Слушать изменения состояния:
```typescript
contractTypeListener.startListening({
  predicate: (action, currentState, previousState) => {
    const currentProducts = (currentState as RootState).product.items;
    const previousProducts = (previousState as RootState).product.items;
    return currentProducts !== previousProducts;
  },
  effect: async (action, listenerApi) => {
    // Логика при изменении состояния
  },
});
```

### С задержкой (debounce):
```typescript
contractTypeListener.startListening({
  matcher: isAnyOf(setProducts, setFetchedProducts, fetchProducts.fulfilled),
  effect: async (action, listenerApi) => {
    await listenerApi.delay(500); // Ждем 500мс
    
    const state = listenerApi.getState() as RootState;
    const products = state.product.items;
    
    console.log('Products updated (debounced):', products);
  },
});
```

### С отменой предыдущих вызовов:
```typescript
contractTypeListener.startListening({
  matcher: isAnyOf(setProducts, setFetchedProducts, fetchProducts.fulfilled),
  effect: async (action, listenerApi) => {
    listenerApi.cancelActiveListeners(); // Отменяем предыдущие вызовы
    
    const state = listenerApi.getState() as RootState;
    const products = state.product.items;
    
    console.log('Products updated:', products);
  },
});
```

## API Listener

### listenerApi методы:

- `getState()` - получить текущее состояние
- `getOriginalState()` - получить предыдущее состояние
- `dispatch(action)` - отправить действие
- `delay(ms)` - задержка выполнения
- `cancelActiveListeners()` - отменить активные listeners
- `signal` - AbortSignal для отмены

### Параметры listener:

- `matcher` - функция для определения, какие действия слушать
- `actionCreator` - конкретное действие для отслеживания
- `predicate` - функция для проверки условий
- `effect` - асинхронная функция, которая выполняется при срабатывании

## Работа с Thunk Actions

Когда продукты загружаются через thunk (например, `fetchProducts`), они обновляют состояние через `extraReducers`, а не через обычные `reducers`. Поэтому важно слушать именно thunk action:

```typescript
// Правильно - слушаем thunk action
matcher: isAnyOf(setProducts, setFetchedProducts, fetchProducts.fulfilled)

// Неправильно - не слушаем thunk action
matcher: isAnyOf(setProducts, setFetchedProducts)
```

### Альтернативный способ - слушать изменения состояния:

Если вы хотите слушать любые изменения в состоянии products независимо от того, как они произошли:

```typescript
contractTypeListener.startListening({
  predicate: (action, currentState, previousState) => {
    const currentProducts = (currentState as RootState).product.items;
    const previousProducts = (previousState as RootState).product.items;
    
    // Проверяем, изменились ли продукты
    return currentProducts.length !== previousProducts.length || 
           JSON.stringify(currentProducts) !== JSON.stringify(previousProducts);
  },
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const products = state.product.items;
    
    console.log('Products state changed:', products);
  },
});
```

## Дополнительные примеры

Смотрите файл `ProductListenerExamples.ts` для более подробных примеров различных сценариев использования listeners. 