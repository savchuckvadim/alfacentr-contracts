# BackButton Component

Умная кнопка "Назад", которая появляется только при наличии истории навигации или указанном fallback пути.

## Особенности

- ✅ **Автоматическое отслеживание истории** - кнопка появляется только когда есть куда возвращаться
- ✅ **Fallback путь** - можно указать путь по умолчанию для возврата
- ✅ **SessionStorage** - сохраняет историю навигации между страницами
- ✅ **Адаптивный дизайн** - поддерживает различные варианты и размеры
- ✅ **Плавные анимации** - hover эффекты и переходы

## Использование

### Базовое использование
```tsx
import { BackButton } from "@/modules/shared"

// Простая кнопка "назад"
<BackButton />

// С текстом
<BackButton showText>Вернуться</BackButton>
```

### С fallback путем
```tsx
// Если нет истории, вернется на /dashboard
<BackButton fallbackPath="/dashboard" />

// Всегда показывать кнопку, если указан fallback
<BackButton fallbackPath="/dashboard" alwaysShow />
```

### Различные варианты стилизации
```tsx
// Ghost вариант (по умолчанию)
<BackButton variant="ghost" />

// Outline вариант
<BackButton variant="outline" />

// Разные размеры
<BackButton size="sm" />
<BackButton size="lg" />
<BackButton size="icon" />

// С кастомными стилями
<BackButton 
    className="text-primary hover:text-primary/80"
    variant="ghost"
    size="sm"
/>
```

## Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `fallbackPath` | `string` | - | Путь для возврата, если нет истории |
| `className` | `string` | `""` | Дополнительные CSS классы |
| `variant` | `"default" \| "ghost" \| "outline"` | `"ghost"` | Вариант кнопки |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"sm"` | Размер кнопки |
| `showText` | `boolean` | `false` | Показывать ли текст рядом с иконкой |
| `children` | `React.ReactNode` | - | Кастомный текст (если showText=true) |
| `alwaysShow` | `boolean` | `false` | Показывать всегда, если указан fallbackPath |

## Логика работы

1. **Проверка истории**: Компонент проверяет `window.history.length > 1`
2. **SessionStorage**: Сохраняет текущий путь и отслеживает предыдущий
3. **Условия показа**: Кнопка показывается если:
   - Есть история навигации
   - Указан fallbackPath (и он отличается от текущего пути)
   - Есть предыдущий путь в sessionStorage
4. **Поведение при клике**:
   - Если есть история → `router.back()`
   - Если нет истории, но есть fallback → `router.push(fallbackPath)`

## Примеры интеграции

### В хедере
```tsx
<div className="flex items-center gap-4">
    <BackButton fallbackPath="/dashboard" />
    <h1>Заголовок страницы</h1>
</div>
```

### В модальном окне
```tsx
<DialogHeader>
    <BackButton variant="ghost" size="sm" />
    <DialogTitle>Заголовок модального окна</DialogTitle>
</DialogHeader>
```

### В карточке
```tsx
<Card>
    <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Заголовок карточки</CardTitle>
            <BackButton size="icon" variant="ghost" />
        </div>
    </CardHeader>
</Card>
``` 