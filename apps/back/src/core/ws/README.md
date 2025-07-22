# WebSocket Events Module

Модуль для отправки событий через WebSocket без хардкода. Позволяет отправлять события конкретным пользователям, в комнаты или по socketId.

## Структура модуля

```
ws/
├── ws-events.service.ts      # Основной сервис для отправки событий
├── ws-events.enum.ts         # Enum с типами событий
├── ws-events.module.ts       # Модуль
├── dto/
│   └── ws-event.dto.ts       # DTO для событий
├── ws-events.examples.ts     # Примеры использования
└── README.md                 # Документация
```

## Основные компоненты

### WsEventsService

Основной сервис для отправки WebSocket событий.

#### Методы:

- `emitToUser(userId, event, payload, context?)` - отправка пользователю
- `emitToRoom(room, event, payload, context?)` - отправка в комнату
- `emitToSocket(socketId, event, payload, context?)` - отправка по socketId
- `emitToDeal(dealId, event, payload, context?)` - отправка в комнату сделки
- `emitToAll(event, payload, context?)` - отправка всем клиентам
- `emit(event, payload, context)` - универсальный метод
- `emitTaskCompleted(context, result)` - событие успешного выполнения
- `emitTaskFailed(context, error, details?)` - событие ошибки
- `emitTaskProgress(context, progress, message?)` - событие прогресса

### WsEvents

Enum с предопределенными типами событий:

```typescript
export enum WsEvents {
    TaskCompleted = 'task.completed',
    TaskFailed = 'task.failed',
    TaskProgress = 'task.progress',
    DocumentNumberGenerated = 'document-number:done',
    CompanyUpdated = 'company.updated',
    // ... и другие
}
```

## Использование

### 1. Импорт модуля

```typescript
import { WsEventsModule } from '@/core/ws';

@Module({
    imports: [WsEventsModule],
    // ...
})
export class YourModule {}
```

### 2. Инъекция сервиса

```typescript
import { WsEventsService, WsEvents } from '@/core/ws';

@Injectable()
export class YourService {
    constructor(private readonly wsEvents: WsEventsService) {}
}
```

### 3. Отправка событий

#### Отправка по socketId (для очередей)

```typescript
// В процессоре очереди
async handle(job: Job<YourDto>) {
  const { socketId, dealId } = job.data;

  try {
    const result = await this.processJob();

    this.wsEvents.emitTaskCompleted(
      { socketId, dealId: dealId.toString() },
      result
    );
  } catch (error) {
    this.wsEvents.emitTaskFailed(
      { socketId, dealId: dealId.toString() },
      error.message
    );
  }
}
```

#### Отправка пользователю

```typescript
this.wsEvents.emitToUser(
    'user-123',
    WsEvents.Notification,
    { message: 'Hello!' },
    { dealId: 'deal-456' },
);
```

#### Отправка в комнату

```typescript
this.wsEvents.emitToRoom('admin-room', WsEvents.CompanyUpdated, {
    companyId: 123,
    status: 'updated',
});
```

#### Отправка прогресса

```typescript
this.wsEvents.emitTaskProgress({ socketId: 'socket-123' }, 75, 'Processing...');
```

### 4. Контекст событий

Каждое событие может содержать контекстную информацию:

```typescript
interface WsEventContext {
    userId?: string;
    dealId?: string;
    socketId?: string;
    room?: string;
}
```

## Примеры использования

### В процессоре очереди

```typescript
@Processor(QueueNames.YOUR_QUEUE)
export class YourQueueProcessor {
    constructor(private readonly wsEvents: WsEventsService) {}

    @Process(JobNames.YOUR_JOB)
    async handle(job: Job<YourDto>) {
        const { socketId, dealId, userId } = job.data;

        try {
            // Начало обработки
            this.wsEvents.emit(
                WsEvents.TaskStarted,
                {},
                { socketId, dealId, userId },
            );

            // Прогресс
            this.wsEvents.emitTaskProgress(
                { socketId, dealId, userId },
                25,
                'Starting...',
            );

            // Обработка
            const result = await this.processData();

            // Завершение
            this.wsEvents.emitTaskCompleted(
                { socketId, dealId, userId },
                result,
            );
        } catch (error) {
            this.wsEvents.emitTaskFailed(
                { socketId, dealId, userId },
                error.message,
            );
        }
    }
}
```

### В контроллере

```typescript
@Controller('api')
export class YourController {
    constructor(private readonly wsEvents: WsEventsService) {}

    @Post('generate-document')
    async generateDocument(@Body() dto: { socketId: string; dealId: string }) {
        try {
            const result = await this.documentService.generate(dto);

            this.wsEvents.emitTaskCompleted(
                { socketId: dto.socketId, dealId: dto.dealId },
                result,
            );

            return { success: true };
        } catch (error) {
            this.wsEvents.emitTaskFailed(
                { socketId: dto.socketId, dealId: dto.dealId },
                error.message,
            );

            throw error;
        }
    }
}
```

## Преимущества

1. **Без хардкода** - все события типизированы через enum
2. **Гибкость** - поддержка различных способов отправки (socketId, userId, room, dealId)
3. **Контекст** - каждое событие содержит метаданные
4. **Типизация** - полная поддержка TypeScript
5. **Логирование** - автоматическое логирование всех событий
6. **Переиспользование** - единый сервис для всех WebSocket событий

## Миграция с существующего кода

### Было:

```typescript
this.ws.sendToClient(socketId, {
    event: 'document-number:done',
    data: { ...result },
});
```

### Стало:

```typescript
this.wsEvents.emitTaskCompleted(
    { socketId, dealId: dealId.toString() },
    result,
);
```

## Добавление новых типов событий

1. Добавьте новый тип в `WsEvents` enum
2. При необходимости создайте специализированный метод в `WsEventsService`
3. Обновите документацию

```typescript
// В ws-events.enum.ts
export enum WsEvents {
  // ... существующие события
  NewCustomEvent = 'custom.event',
}

// В ws-events.service.ts (опционально)
emitCustomEvent(context: WsEventContext, data: any) {
  this.emit(WsEvents.NewCustomEvent, data, context);
}
```
