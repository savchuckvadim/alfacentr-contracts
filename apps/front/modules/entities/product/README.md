# Product Entity

Модуль для работы с продуктами в системе.

## Структура

```
product/
├── index.ts              # Основные экспорты
├── model/
│   ├── ProductSlice.ts   # Redux slice для продуктов
│   └── ProductThunk.ts   # Redux thunks для API вызовов
├── ui/
│   ├── index.ts          # Экспорты UI компонентов
│   └── ProductList.tsx   # Компонент списка продуктов
└── README.md             # Документация
```

## Использование

### Импорт

```typescript
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  ProductList 
} from '@/modules/entities/product';
```

### Redux Store

```typescript
// В store
import { productReducer } from '@/modules/entities/product';

const store = configureStore({
  reducer: {
    product: productReducer,
    // другие reducers...
  }
});
```

### Компонент

```typescript
import { ProductList } from '@/modules/entities/product';

function MyComponent() {
  return <ProductList dealId="123" />;
}
```

## API

### Thunks

- `fetchProducts(dealId: string)` - Получение списка продуктов для сделки
- `createProduct(productData: any)` - Создание нового продукта
- `updateProduct({ productId, productData })` - Обновление продукта
- `deleteProduct(productId: string)` - Удаление продукта

### State

```typescript
interface IProductState {
  items: IProduct[]        // Список продуктов
  editable: IProduct | null // Редактируемый продукт
  loading: boolean         // Статус загрузки
  error: null | string     // Ошибка
}
```

### Actions

- `setProducts(products: IProduct[])` - Установка списка продуктов
- `setEditableProduct(product: IProduct | null)` - Установка редактируемого продукта
- `clearError()` - Очистка ошибки

## Обработка ошибок

Модуль интегрирован с системой обработки ошибок:

- Автоматическая обработка API ошибок
- Интеграция с ErrorHandler
- Поддержка критических ошибок для ErrorBoundary

## Временные решения

⚠️ **Внимание**: В текущей версии используются временные типы и ID:

- `IProduct` - временный интерфейс (нужно создать в @alfa/entities)
- `PRODUCT_ENTITY_ID = 1037` - временный ID (нужно добавить в EntityTypeIdEnum)
- `getProduct()` - временная функция преобразования

Для полной интеграции необходимо:

1. Создать типы продуктов в пакете @alfa/entities
2. Добавить PRODUCT в EntityTypeIdEnum
3. Создать getProduct функцию в @alfa/entities
4. Обновить импорты в ProductThunk.ts и ProductSlice.ts 