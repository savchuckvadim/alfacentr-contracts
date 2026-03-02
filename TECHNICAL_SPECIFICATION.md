# Техническое задание: Fullstack приложение Alfacentr

## 1. Общее описание проекта

### 1.1. Назначение

**Alfacentr** — это fullstack веб-приложение, встраиваемое в CRM систему Bitrix24, которое предоставляет удобный интерфейс для автоматизации бизнес-процессов компании. Приложение полностью отвечает за создание юридических документов (счет, акт, договор различных видов) и автоматизацию процесса проведения семинаров.

### 1.2. Основные функции

- **Генерация юридических документов**: автоматическое создание счетов, актов, договоров (5 видов)
- **Управление семинарами**: автоматизация всего процесса проведения семинаров
- **Интеграция с Bitrix24**: полная интеграция с CRM системой через REST API
- **Кастомная нумерация документов**: система автоматической нумерации документов с префиксами
- **WebSocket коммуникация**: real-time обновления статусов генерации документов
- **Очереди задач**: асинхронная обработка тяжелых операций через Bull Queue

### 1.3. Технологический стек

#### Backend

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7
- **Queue System**: Bull (Redis-based)
- **WebSocket**: Socket.IO
- **Document Generation**: docx, docxtemplater, exceljs
- **Storage**: AWS S3 (через @aws-sdk/client-s3)
- **Database**: Redis (для очередей)

#### Frontend

- **Framework**: Next.js 15.x (App Router)
- **UI Library**: React 19.x
- **State Management**: Redux Toolkit
- **Architecture**: Feature-Sliced Design (FSD)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

#### Инфраструктура

- **Containerization**: Docker, Docker Compose
- **Package Manager**: pnpm (monorepo)
- **Build System**: Turbo (monorepo)
- **Monitoring**: Prometheus, Loki, Promtail

#### Shared Packages (Monorepo)

- `@workspace/bitrix` - библиотека для работы с Bitrix24 API
- `@workspace/api` - общие API типы и утилиты
- `@workspace/bx` - утилиты для Bitrix
- `@workspace/bx-rq` - работа с реквизитами Bitrix
- `@workspace/pbx` - портальный сервис Bitrix
- `@workspace/ws` - WebSocket клиент
- `@workspace/ui` - общие UI компоненты
- `@workspace/theme` - темизация
- `@alfa/entities` - бизнес-сущности проекта

---

## 2. Архитектура приложения

### 2.1. Структура Monorepo

```
Alfacentr/
├── apps/
│   ├── back/          # NestJS Backend приложение
│   └── front/         # Next.js Frontend приложение
├── packages/
│   ├── alfa/          # Бизнес-сущности и типы
│   ├── bitrix/        # Библиотека Bitrix24 API
│   ├── api/           # Общие API типы
│   ├── bx/            # Bitrix утилиты
│   ├── bx-rq/         # Реквизиты Bitrix
│   ├── pbx/           # Портальный сервис
│   ├── ws/            # WebSocket клиент
│   ├── ui/            # UI компоненты
│   └── theme/         # Темизация
├── docker/            # Docker конфигурации
└── docker-compose.yml # Docker Compose для production
```

### 2.2. Backend архитектура (NestJS)

#### Структура модулей:

```
apps/back/src/
├── modules/
│   ├── document-generate/    # Генерация документов
│   ├── document-number/      # Кастомная нумерация
│   ├── alfa-fields/          # Поля сделок
│   ├── alfa-products/         # Товары/продукты
│   ├── on-deal-init/          # Инициализация сделок
│   ├── hooks/                 # Webhook обработчики
│   ├── bitrix/                # Bitrix интеграция
│   ├── queue/                 # Очереди задач
│   ├── pbx/                   # Портальный сервис
│   ├── telegram/              # Telegram уведомления
│   └── ...
├── core/
│   ├── ws/                    # WebSocket модуль
│   ├── storage/               # Хранилище файлов
│   └── ...
└── clients/                   # HTTP клиенты
```

### 2.3. Frontend архитектура (FSD)

#### Feature-Sliced Design структура:

```
apps/front/modules/
├── app/              # Инициализация приложения
├── pages/            # Страницы приложения
├── widgetes/         # Виджеты (композитные блоки)
├── features/         # Бизнес-функции
├── entities/         # Бизнес-сущности
├── shared/           # Переиспользуемые компоненты
└── process/          # Бизнес-процессы
```

---

## 3. Детальное описание модулей

### 3.1. Модуль генерации документов (`document-generate`)

#### 3.1.1. Эндпоинты

**POST `/document-generate`**

- **Описание**: Генерация юридических документов (счет, акт, договор)
- **Контроллер**: `DocumentGenerateController`
- **Обработка**: Асинхронная через очередь `DOCUMENT`
- **DTO**: `DocumentGenerateDto`

**Параметры запроса:**

```typescript
{
  domain: string;                    // Домен Bitrix24
  userId: number;                     // ID пользователя
  socketId?: string;                  // ID WebSocket соединения (для real-time уведомлений)
  clientType: RQ_TYPE;                // Тип клиента (ORGANIZATION, BUDGET, IP, FIZ, ADVOKAT)
  contractType: EContractType;        // Тип договора (seminar, ppk, seminar_ppk, up)
  dealId: number;                     // ID сделки в Bitrix24
  fields?: DocumentGenerateFieldsDto; // Поля для генерации
  header?: string;                    // Шапка договора
  paragraph?: string;                 // Текст договора
  paragraphItems?: string[];          // Элементы пунктов договора
  totalSum: string;                   // Сумма договора
  client?: string[];                  // Клиент
  clientShortRq?: string;             // Краткие реквизиты клиента
  clientSignature?: string;           // Подпись клиента
  clientCompanyTitle?: string;         // Наименование компании для акта
  clientDirectorInitials?: string;     // Инициалы директора для акта
  documentPrefixNumber?: string;       // Номер документа с префиксом
  documentPrefix?: string;             // Префикс документа
  documentCounter?: string;           // Счетчик документа
  email?: {
    needEmail?: boolean;               // Нужно ли отправлять email
    email?: string;                    // Email адрес
    phone?: string;                    // Телефон
    name?: string;                    // Имя получателя
  };
  seminarParticipantsCount?: string;  // Количество участников семинара
  ppkApplicationData?: IPpkDocumentApplicationData; // Данные для ППК заявки
}
```

**Типы договоров (`EContractType`):**

- `seminar` - Семинар
- `ppk` - ППК (Профессиональная переподготовка и повышение квалификации)
- `seminar_ppk` - Семинар ППК
- `up` - УП (Управление проектами)

**Типы клиентов (`RQ_TYPE`):**

- `ORGANIZATION` - Организация
- `BUDGET` - Бюджетная организация
- `IP` - Индивидуальный предприниматель
- `FIZ` - Физическое лицо
- `ADVOKAT` - Адвокат

**Типы генерируемых документов:**

1. **Договоры:**
    - `SEMINAR_DEAL` (ID: 135) - Договор Семинар СДЕЛКА
    - `SEMINAR_PPK_DEAL` (ID: 134) - Договор Семинар ППК СДЕЛКА
    - `PPK_DEAL` (ID: 133) - Договор ППК СДЕЛКА

2. **Счета:**
    - `INVOISE_WITH_STAMPS` (ID: 136) - Счет с печатью СЕМИНАРЫ СДЕЛКА
    - `INVOISE_WITHOUT_STAMPS` (ID: 138) - Счет без печати СЕМИНАРЫ СДЕЛКА
    - `INVOISE_QR_WITH_STAMPS` (ID: 148) - Счет с QR-кодом и печатью

3. **Акты:**
    - `ACT` (ID: 140) - Акт оказанных услуг

#### 3.1.2. Детальный процесс генерации документов

**Этап 1: Получение запроса и добавление в очередь**

1. **Контроллер `DocumentGenerateController.generateDocument()`:**
    - Принимает `DocumentGenerateDto` через POST запрос
    - Добавляет задачу в очередь `DOCUMENT` с типом `DOCUMENT_GENERATE` через `QueueDispatcherService.dispatch()`
    - Возвращает DTO клиенту (не дожидаясь выполнения)

2. **Процессор очереди `DocumentGenerateQueueProcessor.handle()`:**
    - Обрабатывает задачу из очереди `DOCUMENT`
    - Извлекает `socketId` из DTO для последующей отправки WebSocket уведомления
    - Вызывает `DocumentBitrixGenerateUseCase.generateDocumentAndPushToBx(dto)`
    - После завершения отправляет WebSocket событие `document-generate:done` клиенту (если `socketId` указан)
    - Отправляет уведомление в Telegram о результате

**Этап 2: Инициализация сервисов (`DocumentGenerateFlowService.generateDocument()`)**

1. **Инициализация Bitrix сервиса:**
    - Инициализация через `PBXService.init('alfacentr.bitrix24.ru')`
    - Получение экземпляра `BitrixService` для работы с Bitrix24 API

2. **Создание сервисов:**
    - `BxTimelineService` - для создания записей в Timeline сделки (userId, entityId)
    - `BxBatchDocumentSendService` - для batch отправки документов в Bitrix24 (entityId, ownerType: DEAL)
    - `DocumentGenerateDocService` - для генерации DOCX документов
    - `DocumentGeneratePdfService` - для конвертации в PDF
    - `PpkApplicationGenerateService` - для генерации ППК заявок
    - Инициализация массива `filesForSend: [string, string][]` для хранения файлов для email

**Этап 3: Подготовка полей договора (`DocumentContractFieldsService.getContractFields()`)**

1. **Выбор шаблона договора:**
    - На основе `contractType` выбирается шаблон:
        - `seminar_ppk` → `SEMINAR_PPK_DEAL` (ID: 134)
        - `seminar` → `SEMINAR_DEAL` (ID: 135)
        - `ppk` → `PPK_DEAL` (ID: 133)
        - Иначе → `INVOISE_WITH_STAMPS` (ID: 136) - fallback

2. **Формирование полей:**
    - Создается объект `fields: Record<string, string | string[]>`
    - Для каждого поля шаблона заполняется значение:
        - `Header` → `dto.header` (шапка договора)
        - `Paragraph12` → формируется из `dto.paragraphItems[]` через `getParagraphByItems()`
            - Если массив пустой → строка с подчеркиваниями
            - Если 1 элемент → "Консультационном семинаре : [элемент]"
            - Если >1 элемента → "Консультационных семинарах : [первый элемент]" + остальные элементы
        - `ClientRq` → `dto.client[]` (массив реквизитов клиента)
        - `EndActionDate` → дата через 365 дней от текущей даты (формат: YYYY-MM-DD)
        - `Paragraph3` → фиксированный текст об оплате
        - `DocumentPrefixNumber` → `dto.documentPrefixNumber`
        - `DocumentNumberCounter` → `dto.documentPrefixNumber` (дублируется)
        - `ClientSignature` → `dto.clientSignature`
        - `DocumentParticipantsCount` → `dto.seminarParticipantsCount` (если есть)
        - `DocumentContractEndDate` → дата через 365 дней
        - `UfCrm8EmailContactForDor` → `dto.email.email` или строка с подчеркиваниями
    - Добавляется поле `DocumentTitle` → `"Договор №{documentPrefixNumber}"`

3. **Возврат данных:**
    - Возвращается объект: `{ templateId: number, fields: Record<string, string | string[]> }`

**Этап 4: Генерация DOCX документов (`DocumentGenerateDocService.generateDocumentsBtch()`)**

1. **Генерация договора:**
    - Вызывается `BxBatchDocumentSendService.add()`:
        - `stampsEnabled: 0` (без печати)
        - `values: fields` (подготовленные поля)
        - `templateId: templateId` (ID шаблона договора)
        - `documentCode: CURRENT_CONTRACT_WITHOUT_PT`
    - Запрос добавляется в batch через `bitrix.api.addCmdBatch()`
    - Метод Bitrix API: `crm.documentgenerator.document.add`
    - Параметры:
        - `templateId` - ID шаблона
        - `entityId` - ID сделки
        - `entityTypeId` - тип сущности (DEAL)
        - `value: 1`
        - `stampsEnabled: 0`
        - `values` - поля для заполнения
        - `fields` - специальные настройки полей (для `Paragraph12` установлен `MULTIPLE: 'Y'`, `SEPARATOR: 3`)

2. **Генерация акта:**
    - Вызывается `getActFile()`:
        - Шаблон: `ACT` (ID: 140)
        - Поля:
            - `UfCrm8ShotReqClient` → `dto.clientShortRq`
            - `ShortClientRq` → `dto.clientShortRq`
            - `DocumentNumber` → `dto.documentCounter`
            - `TITLE` → `dto.documentPrefixNumber`
            - `DocumentTitle` → `"Акт оказанных услуг №{documentCounter} к Договору №{documentPrefixNumber}"`
            - `DocumentPrefixNumber` → `dto.documentPrefixNumber`
            - `DocumentNumberCounter` → `dto.documentCounter`
            - `DocumentCompanyTitle` → `dto.clientCompanyTitle`
            - `DocumentDirectorInitials` → `dto.clientDirectorInitials`
        - `stampsEnabled: 0`
        - `documentCode: CURRENT_ACT_WITH_PT`

3. **Генерация счетов (`getInvoicesFiles()`):**
    - Выбор шаблонов на основе `clientType`:
        - Если `clientType === FIZ`:
            - С печатью: `INVOISE_QR_WITH_STAMPS` (ID: 148)
            - Без печати: `INVOISE_QR_WITHOUT_STAMPS` (ID: 149, если существует)
        - Иначе:
            - С печатью: `INVOISE_WITH_STAMPS` (ID: 136)
            - Без печати: `INVOISE_WITHOUT_STAMPS` (ID: 138)
    - Генерируются два счета:
        - С печатью (`stampsEnabled: 1`, `documentCode: CURRENT_INVOICES_WITH_PT`)
        - Без печати (`stampsEnabled: 0`, `documentCode: CURRENT_INVOICES_WITHOUT_PT`)
    - Поля для счетов:
        - `ShortClientRq` → `dto.clientShortRq`
        - `DocumentPrefixNumber` → `dto.documentPrefixNumber`
        - `DocumentNumberCounter` → `dto.documentCounter`
        - `DocumentTitle` → `"Счет №{documentCounter} к Договору №{documentPrefixNumber}"`

4. **Выполнение batch запросов:**
    - После добавления всех запросов в batch вызывается `bitrix.api.callBatchWithConcurrency(1)`
    - Все запросы выполняются последовательно (concurrency: 1)
    - Возвращается массив результатов `IBitrixBatchResponseResult[]`

**Этап 5: Конвертация в PDF (`DocumentGeneratePdfService.pdfGenerate()`)**

1. **Создание Timeline записи:**
    - Отправляется сообщение: "⌛ Ожидание генерации PDF ..." (тип: 'waiting')

2. **Получение Bitrix ID полей документов:**
    - `currentContractWithoutPtBitrixId` - поле договора без печати
    - `currentInvoicesBitrixId` - поле счета с печатью
    - `currentInvoicesWithoutPtBitrixId` - поле счета без печати
    - `currentActBitrixId` - поле акта

3. **Обработка результатов batch:**
    - Для каждого результата из batch:
        - Извлекаются документы по ключам:
            - `CURRENT_ACT_WITH_PT`
            - `CURRENT_CONTRACT_WITHOUT_PT`
            - `CURRENT_INVOICES_WITH_PT`
            - `CURRENT_INVOICES_WITHOUT_PT`
        - Для каждого документа:
            - **Акт (`CURRENT_ACT_WITH_PT`):**
                - Скачивается файл через `bitrix.file.downloadBitrixFileAndConvertToBase64(document.downloadUrlMachine)`
                - Конвертируется в base64 формат `[string, string]` (имя файла, содержимое)
                - Добавляется в `filesForSend`
                - Сохраняется в `dealFields[currentActBitrixId].fileData`

            - **Счет с печатью (`CURRENT_INVOICES_WITH_PT`):**
                - Вызывается `expectPdfFile(document.id)` - ожидание генерации PDF
                - Ожидание выполняется в цикле с задержкой 15 секунд между попытками
                - Проверяется наличие `document.pdfUrlMachine` через API `crm.documentgenerator.document.get`
                - После получения PDF скачивается через `getPdfFileData()` → `bitrix.file.downloadBitrixFileAndConvertToBase64(document.pdfUrlMachine)`
                - Добавляется в `filesForSend`
                - Сохраняется в `dealFields[currentInvoicesBitrixId].fileData`

            - **Счет без печати (`CURRENT_INVOICES_WITHOUT_PT`):**
                - Скачивается DOCX файл через `bitrix.file.downloadBitrixFileAndConvertToBase64(document.downloadUrlMachine)`
                - Добавляется в `filesForSend`
                - Сохраняется в `dealFields[currentInvoicesWithoutPtBitrixId].fileData`

            - **Договор (`CURRENT_CONTRACT_WITHOUT_PT`):**
                - Скачивается DOCX файл через `bitrix.file.downloadBitrixFileAndConvertToBase64(document.downloadUrlMachine)`
                - Добавляется в `filesForSend`
                - Сохраняется в `dealFields[currentContractWithoutPtBitrixId].fileData`

4. **Обновление сделки:**
    - Все файлы сохраняются в поля сделки через `bitrix.deal.update(entityId, dealFields)`
    - Каждое поле содержит `fileData: [string, string]` (имя файла, base64 содержимое)

5. **Создание Timeline записи:**
    - Отправляется сообщение: "📜 PDF сгенерирован" (тип: 'document')

**Этап 6: Генерация ППК заявки (условно, если требуется)**

**Условие:** `contractType === seminar_ppk || contractType === ppk` И `dto.ppkApplicationData` существует

1. **Вызов `PpkApplicationGenerateService.getPpkApplicationFile()`:**
    - Получается Bitrix ID поля `CURRENT_APPLICATION_DOC`
    - Создается Timeline запись: "⏳ Ожидание генерации приложения ППК..." (тип: 'waiting')

2. **Генерация DOCX файла:**
    - Читается шаблон из хранилища: `storage/app/ppk/templates/ppk-application.docx`
    - Используется библиотека `docxtemplater` для заполнения шаблона
    - Данные из `ppkApplicationData` подставляются в шаблон
    - Генерируется buffer через `doc.getZip().generate({ type: 'nodebuffer' })`
    - Конвертируется в base64: `[fileName, fileBase64]`
    - Имя файла: `"Приложение №1.docx"`

3. **Сохранение в Bitrix24:**
    - Файл сохраняется в поле сделки через `bitrix.deal.update()`
    - Добавляется в `filesForSend` для последующей отправки email
    - Получается URL файла из обновленной сделки

4. **Создание Timeline записи:**
    - Если URL получен: "📜<a href='{url}'> Приложение ППК сгенерировано №{document_number}</a>" (тип: 'ppk')
    - Если ошибка: "❌ Произошла ошибка: Приложение ППК не сгенерировано" (тип: 'error')

**Этап 7: Финальная Timeline запись**

- Отправляется сообщение: "✅ Документы сгенерированы" (тип: 'success')

**Этап 8: Отправка Email (условно, если требуется)**

**Условие:** `dto.email.needEmail === true` И `dto.email.email` существует

1. **Задержка и Timeline:**
    - Выполняется задержка 500ms
    - Создается Timeline запись: "⌛ Отправка email..." (тип: 'email')

2. **Создание Email сервиса:**
    - Инициализация `EmailService`:
        - `bitrix` - Bitrix сервис
        - `filesForSend` - массив файлов для отправки
        - `email` - адрес получателя
        - `name` - имя получателя (или пустая строка)
        - `subject` - номер договора (`dto.documentPrefixNumber`)
        - `body` - пустая строка (не используется)
        - `dealId` - ID сделки

3. **Формирование HTML тела письма (`getEmailHtmlBody()`):**
    - Получается HTML заявки клиента через `GetDealBidItemsUseCase.getItems(dealId, HTML)`
    - Формируется HTML шаблон письма:
        - Приветствие с именем получателя
        - Информация о вложенных документах (Договор, Счет, Акт)
        - Инструкции по подписанию документов
        - Информация о СБИС ID для ЭДО
        - Контактная информация компании
        - Логотип компании
        - Исходная заявка клиента (HTML)

4. **Создание активности Email:**
    - Вызывается `bitrix.activity.createActivity()`:
        - `OWNER_TYPE_ID: DEAL`
        - `OWNER_ID: entityId`
        - `TYPE_ID: EMAIL`
        - `DIRECTION: 2` (исходящее)
        - `RESPONSIBLE_ID: '502'`
        - `SETTINGS.MESSAGE_FROM: "Иванов Иван <laravelsamvel@gmail.com>"`
        - `SUBJECT: "Документы на согласование Договор №{documentPrefixNumber} от ООО "Альфацентр""`
        - `DESCRIPTION: body` (HTML)
        - `COMPLETED: 'Y'`
        - `DESCRIPTION_TYPE: 3`
        - `START_TIME` и `END_TIME` - текущее время и +1 час
        - `COMMUNICATIONS` - массив с email получателя
        - `FILES` - массив файлов из `filesForSend` (каждый файл как `{ fileData: [string, string] }`)

5. **Если email не требуется:**
    - Создается Timeline запись: "📄 Email не будет отправлен. Только формирование документов" (тип: 'email')

**Этап 9: Возврат результата**

Возвращается объект:

```typescript
{
  result: IBitrixBatchResponseResult[],  // Результаты batch запросов
  filesCount: number,                    // Количество файлов
  files: [string, string][],             // Массив файлов [имя, base64]
  mailResult: any                        // Результат отправки email (или null)
}
```

**Этап 10: WebSocket уведомление**

- Процессор очереди отправляет событие `document-generate:done` клиенту через `WsService.sendToClient()`
- Структура события:

```typescript
{
  event: 'document-generate:done',
  data: {
    result: IBitrixBatchResponseResult[],
    filesCount: number,
    files: [string, string][],
    mailResult: any,
    result: {
      success: true,
      message: 'Document generated successfully'
    }
  }
}
```

#### 3.1.3. Структура данных

**Коды полей документов (`EnumDealCurrentDocumentFieldCode`):**

- `CURRENT_CONTRACT_WITHOUT_PT` - договор без печати
- `CURRENT_INVOICES_WITH_PT` - счет с печатью
- `CURRENT_INVOICES_WITHOUT_PT` - счет без печати
- `CURRENT_ACT_WITH_PT` - акт с печатью
- `CURRENT_APPLICATION_DOC` - приложение ППК

**Коды полей шаблонов (`DocumentGenerateFieldTemplateCode`):**

- `ClientRq` - реквизиты клиента
- `Header` - шапка договора
- `Paragraph12` - текст договора (пункт 1.2)
- `Paragraph3` - текст договора (пункт 3)
- `EndActionDate` - дата окончания действия
- `DocumentPrefixNumber` - номер документа с префиксом
- `DocumentNumberCounter` - счетчик номера документа
- `ClientSignature` - подпись клиента
- `DocumentCompanyTitle` - наименование компании для акта
- `DocumentDirectorInitials` - инициалы директора для акта
- `DocumentParticipantsCount` - количество участников
- `DocumentContractEndDate` - дата окончания договора
- `UfCrm8EmailContactForDor` - email для договора

**ID шаблонов документов:**

- Договор Семинар ППК: 134
- Договор Семинар: 135
- Договор ППК: 133
- Счет с печатью: 136
- Счет без печати: 138
- Счет с QR и печатью: 148
- Акт: 140

#### 3.1.4. Use Cases

- **`DocumentBitrixGenerateUseCase`** - основной use case для генерации документов
    - Метод: `generateDocumentAndPushToBx(dto: DocumentGenerateDto)`
    - Создает экземпляр `DocumentGenerateFlowService` и вызывает `generateDocument()`

- **`DocumentDownloadUseCase`** - скачивание документов (если реализовано)

#### 3.1.5. Сервисы

- **`DocumentGenerateFlowService`** - основной сервис потока генерации
    - Координирует весь процесс генерации
    - Управляет жизненным циклом других сервисов

- **`DocumentGenerateDocService`** - генерация DOCX документов
    - Формирует batch запросы для генерации документов через Bitrix24 API
    - Генерирует: договор, акт, счета (с печатью и без)

- **`DocumentGeneratePdfService`** - конвертация в PDF
    - Ожидает генерацию PDF для счетов с печатью
    - Скачивает все документы из Bitrix24
    - Конвертирует в base64 формат
    - Сохраняет в поля сделки

- **`DocumentContractFieldsService`** - работа с полями договоров
    - Подготавливает поля для заполнения шаблонов
    - Выбирает правильный шаблон на основе типа договора
    - Формирует текст договора из элементов

- **`BxBatchDocumentSendService`** - отправка документов в Bitrix24
    - Добавляет запросы генерации документов в batch
    - Использует Bitrix24 API `crm.documentgenerator.document.add`

- **`BxTimelineService`** - создание записей в Timeline
    - Создает записи в Timeline сделки с различными типами сообщений
    - Типы: 'error', 'success', 'document', 'pdf', 'ppk', 'email', 'clock', 'waiting'

- **`EmailService`** - отправка email
    - Формирует HTML тело письма
    - Создает активность Email в Bitrix24
    - Прикрепляет все сгенерированные документы

- **`PpkApplicationGenerateService`** - генерация ППК заявок
    - Генерирует DOCX файл приложения ППК через docxtemplater
    - Использует шаблон из хранилища
    - Сохраняет в поле сделки

**WebSocket события:**

- `document-generate:done` - документы успешно сгенерированы
- Содержит: `result`, `filesCount`, `files`, `mailResult`, `result.success`, `result.message`

---

### 3.2. Модуль кастомной нумерации (`document-number`)

#### 3.2.1. Эндпоинты

**POST `/document-number/by-deal/:dealId`**

- **Описание**: Генерация номера документа на основе сделки
- **Контроллер**: `DocumentNumberController`
- **Обработка**: Асинхронная через очередь `DOCUMENT_NUMBER`
- **DTO**: `DocumentNumberDto`

**Параметры запроса:**

```typescript
{
    domain: string; // Домен Bitrix24
    dealId: number; // ID сделки (из URL параметра)
}
```

**Процесс:**

1. Получение товарных позиций сделки через `BxProductRowService`
2. Возврат данных о товарах с продуктами

**POST `/document-number/by-prefix`**

- **Описание**: Генерация номера документа по префиксу с использованием кастомного счетчика
- **Контроллер**: `DocumentNumberController`
- **Обработка**: Асинхронная через очередь `DOCUMENT_NUMBER_BY_PREFIX`
- **DTO**: `DocumentNumberByPrefixDto`

**Параметры запроса:**

```typescript
{
  dealId: number;           // ID сделки
  prefix?: string;           // Префикс документа (например, "ППК")
  dinamycPrefix: string;     // Динамический префикс (например, "СП-123456")
  socketId: string;          // ID WebSocket соединения
}
```

**Процесс:**

1. Получение или создание элемента в списке Bitrix24 (ID списка: 46)
2. Поиск существующего счетчика по префиксу
3. Если счетчик не найден - создание нового со значением 1
4. Если найден - инкремент счетчика
5. Обновление элемента списка с новым значением счетчика
6. Транслитерация префикса для `ELEMENT_CODE`
7. Отправка WebSocket события `document-number:done` с результатом

**WebSocket события:**

- `document-number:done` - номер документа сгенерирован
- Содержит: `prefix`, `counter`, `get`, `add`, `updated`

**Особенности:**

- Использует Bitrix24 списки для хранения счетчиков
- Автоматическая транслитерация кириллицы в латиницу для кодов элементов
- Поддержка динамических префиксов

---

### 3.3. Модуль полей сделок (`alfa-fields`)

#### 3.3.1. Эндпоинты

**GET `/alfa-fields?domain={domain}`**

- **Описание**: Получение полей сделки и их соответствий с Bitrix24
- **Контроллер**: `AlfaFieldsController`
- **DTO ответа**: `AlfaFieldsResponseDto`

**Параметры запроса:**

- `domain` (query) - Домен Bitrix24

**Ответ:**

```typescript
{
  fieldData: TDealData;        // Данные полей сделки
  bxFieldsIds: string[];       // Массив ID полей в Bitrix24
}
```

**Процесс:**

1. Инициализация Bitrix сервиса для указанного домена
2. Получение всех полей сделки через `AlfaFieldsService`
3. Маппинг полей на структуру `TDealData`
4. Возврат данных полей и их Bitrix ID

**Назначение:**

- Используется для синхронизации полей между фронтендом и Bitrix24
- Позволяет фронтенду знать, какие поля доступны и их Bitrix ID

---

### 3.4. Модуль продуктов (`alfa-products`)

Модуль отвечает за работу с товарами/продуктами из каталога Bitrix24. Система автоматически находит товары на основе данных участников, добавляет их в сделки, определяет категории товаров и связывает их с участниками.

#### 3.4.1. Эндпоинты

**GET `/alfa-bx-products/by-field/:detailText`**

- **Описание**: Поиск продукта в каталоге Bitrix24 по полю "Название заявки" (NAME_BID)
- **Контроллер**: `AlfaBxProductsController`
- **Параметры:**
    - `detailText` (path) - текст для поиска (название заявки из формы участника)
- **Процесс:**
    1. Инициализация Bitrix сервиса для домена `alfacentr.bitrix24.ru`
    2. Поиск товаров в каталоге (iblockId: 24) по полю `NAME_BID` с использованием частичного совпадения (`%`)
    3. Возврат найденных товаров с полной информацией
- **Использование:** Используется для ручного поиска товаров менеджером или для отладки

**GET `/alfa-bx-products/by-id/:productId`**

- **Описание**: Получение детальной информации о продукте по его ID
- **Контроллер**: `AlfaBxProductsController`
- **Параметры:**
    - `productId` (path) - ID продукта в каталоге Bitrix24
- **Процесс:**
    1. Запрос продукта из каталога Bitrix24
    2. Получение всех полей продукта (включая свойства: property172, property174, property158, property168, property154, property155, property156, property164, property166, property216-221, SEMINAR_TOPIC, NAME_BID)
    3. Возврат полной информации о продукте
- **Использование:** Используется фронтендом для получения детальной информации о товарах сделки

**GET `/alfa-deal-products/:domain/:dealId`**

- **Описание**: Получение всех товарных позиций сделки с полной информацией о продуктах
- **Контроллер**: `AlfaDealProductsController`
- **Параметры:**
    - `domain` (path) - Домен Bitrix24 портала
    - `dealId` (path) - ID сделки
- **Ответ:**

```typescript
{
  rowsWithProducts: BxProductRowWithProduct[]; // Товарные позиции с полной информацией о продуктах
}
```

- **Процесс:**
    1. Получение всех товарных позиций (product rows) сделки через `BxProductRowService`
    2. Для каждой позиции получение полной информации о продукте через batch запросы
    3. Объединение данных позиций и продуктов
    4. Возврат структурированных данных
- **Использование:** Основной эндпоинт для фронтенда при загрузке товаров сделки

#### 3.4.2. Категории и типы товаров

**Типы товаров (`ProductType`):**

- `seminar` - Семинар (префикс содержит "СР" или "СН")
- `ppk` - ППК - Профессиональная переподготовка и повышение квалификации (префикс содержит "ППК")
- `seminar_ppk` - Комбинация семинара и ППК (определяется наличием обоих типов)
- `up` - УП - Управление проектами (префикс содержит "УП")

**Определение типа товара:**

- Тип определяется по префиксу в названии товара
- Префикс извлекается из названия по паттерну `[] текст` (например: `[] СР-123` → префикс "СР-123")
- Логика определения:
    ```typescript
    if (префикс.includes('СР') || префикс.includes('СН')) → 'seminar'
    else if (префикс.includes('ППК')) → 'ppk'
    else if (префикс.includes('УП')) → 'up'
    ```

**Структура продукта:**

- Продукты хранятся в каталоге Bitrix24 (iblockId: 24)
- Каждый продукт имеет множество свойств (property172-221, SEMINAR_TOPIC, NAME_BID)
- Продукты связаны с товарными позициями сделок

#### 3.4.3. Автоматическое добавление товаров в сделку

**Сервис:** `AlfaProductService.addPpkProducts()`

**Когда вызывается:**

- Автоматически при обработке webhook `on-deal-init`
- Анализирует поля участников в сделке
- Находит соответствующие товары и добавляет их в сделку

**Процесс:**

1. **Извлечение данных участников:**
    - Система анализирует поля сделки, связанные с участниками
    - Ищет поля с кодами:
        - `accountant_gos` - Бухгалтер госсектор
        - `accountant_medical` - Бухгалтер медицина
        - `zakupki` - Закупки
        - `kadry` - Кадры
        - `corruption` - Коррупция
        - `days` - Дни (массив выбранных дней)

2. **Поиск товаров:**
    - Для каждого заполненного поля участника система ищет товар в каталоге
    - Поиск выполняется по полю `NAME_BID` (Название заявки) с частичным совпадением
    - Дополнительно фильтруется по префиксу сделки (если указан)
    - Используется iblockId: 24 (каталог товаров)

3. **Группировка товаров:**
    - Товары группируются по ID
    - Подсчитывается количество каждого товара (quantity)
    - Удаляются дубликаты

4. **Получение цен:**
    - Для каждого товара запрашивается цена из каталога Bitrix24
    - Используется priceTypeId: 1 (тип цены)
    - Цена добавляется к товару

5. **Сортировка:**
    - Товары сортируются так, чтобы семинары были первыми
    - Это важно для правильного отображения в документах

6. **Добавление в сделку:**
    - Создаются товарные позиции (product rows) для сделки
    - Каждая позиция содержит:
        - `productId` - ID товара
        - `quantity` - количество
        - `price` - цена
        - `productName` - название товара
        - `measureId: 10` - единица измерения (чел.)
        - `measureCode: 792` - код единицы измерения
        - `measureName: 'чел.'` - название единицы измерения
        - `sort` - порядок сортировки

**Особенности:**

- Если участник выбрал несколько дней (`days` - массив), для каждого дня ищется отдельный товар
- Между запросами добавлена задержка 1000ms для избежания rate limiting
- Товары добавляются асинхронно (void await) - не блокирует основной процесс

#### 3.4.4. Получение товарных позиций с продуктами

**Сервис:** `BxProductRowService.getDealProductRowsWithProducts()`

**Процесс:**

1. **Получение товарных позиций:**
    - Запрос всех товарных позиций сделки через `bitrix.productRow.list()`
    - Фильтр: `ownerType = DEAL`, `ownerId = dealId`

2. **Batch запросы продуктов:**
    - Для каждой позиции добавляется batch запрос на получение продукта
    - Используется `bitrix.batch.product.get()` для оптимизации
    - Все запросы выполняются параллельно с ограничением concurrency: 1

3. **Объединение данных:**
    - Каждая товарная позиция объединяется с данными продукта
    - Создается структура `BxProductRowWithProduct`:
        ```typescript
        {
          ...productRow,  // Данные товарной позиции
          product: IBXProduct  // Полная информация о продукте
        }
        ```

4. **Возврат результата:**
    - Возвращается массив товарных позиций с полной информацией о продуктах

**Использование:**

- Фронтенд использует этот метод для отображения товаров сделки
- Позволяет показать не только товарные позиции, но и все свойства продуктов
- Используется для определения типа договора на основе товаров

#### 3.4.5. Определение типа договора на основе товаров

**Логика определения (на фронтенде):**

```typescript
// Проверка наличия товаров разных типов
const hasPpk = products.some(p => префикс.includes('ППК'));
const hasSeminar = products.some(p => префикс.includes('СР') || префикс.includes('СН'));
const hasUp = products.some(p => префикс.includes('УП'));

// Определение типа договора
if (hasPpk && hasSeminar) → EContractType.seminar_ppk
else if (hasPpk) → EContractType.ppk
else if (hasSeminar) → EContractType.seminar
else if (hasUp) → EContractType.up
else → EContractType.seminar (по умолчанию)
```

**Приоритет:**

1. `seminar_ppk` - если есть и семинары, и ППК
2. `ppk` - если есть только ППК
3. `seminar` - если есть только семинары
4. `up` - если есть УП
5. `seminar` - по умолчанию

**Использование:**

- Автоматически устанавливается при загрузке товаров
- Менеджер может вручную изменить тип, если нужно
- Используется для выбора правильного шаблона договора при генерации

#### 3.4.6. Поля продуктов

**Основные поля:**

- `id` - ID продукта в каталоге
- `name` - Название продукта
- `price` - Цена продукта
- `currencyId` - Валюта (обычно 'RUB')
- `iblockId: 24` - ID инфоблока каталога
- `active` - Активен ли продукт

**Специальные свойства (property):**

- `property172-221` - Различные свойства продуктов
- `SEMINAR_TOPIC` - Тема семинара
- `NAME_BID` - Название заявки (используется для поиска)

**Товарные позиции (Product Rows):**

- `id` - ID позиции
- `productId` - ID продукта
- `quantity` - Количество
- `price` - Цена за единицу
- `productName` - Название продукта
- `measureId` - ID единицы измерения
- `measureCode` - Код единицы измерения
- `measureName` - Название единицы измерения (обычно "чел.")
- `sort` - Порядок сортировки
- `ownerType` - Тип владельца (DEAL)
- `ownerId` - ID владельца (ID сделки)

#### 3.4.7. Use Cases

**AlfaDealProductsUseCase:**

- `getDealProductRowsWithProducts(domain, dealId)` - получение товарных позиций с продуктами
- Используется контроллером `AlfaDealProductsController`

**AlfaProductService (используется в on-deal-init):**

- `addPpkProducts(dealId, dealValues)` - автоматическое добавление товаров в сделку
- Вызывается при обработке webhook создания сделки

#### 3.4.8. Интеграция с другими модулями

**С модулем `on-deal-init`:**

- Автоматически добавляет товары при создании сделки
- Использует данные участников для поиска товаров

**С модулем `document-generate`:**

- Тип договора определяется на основе товаров
- Товары используются для заполнения документов
- Количество участников берется из количества товаров

**С фронтендом:**

- Фронтенд получает товары через эндпоинт `/alfa-deal-products/:domain/:dealId`
- Отображает товары в таблице
- Показывает связи между участниками и товарами
- Использует товары для определения типа договора

---

### 3.5. Модуль инициализации сделок (`on-deal-init`)

#### 3.5.1. Эндпоинты

**POST `/seminar/create-deal/:dealId`**

- **Описание**: Инициализация сделки при создании
- **Контроллер**: `OnDealInitController`
- **Use Case**: `OnDealInitUseCase.onDealCreate()`

**POST `/seminar/get-deal-values/:dealId`**

- **Описание**: Получение значений полей сделки
- **Контроллер**: `OnDealInitController`
- **Use Case**: `FrontDealUseCase.getDealValues()`

**POST `/seminar/get-fields-data`**

- **Описание**: Получение данных полей сделки
- **Контроллер**: `OnDealInitController`
- **Use Case**: `FrontDealUseCase.getFieldsIds()`

**Процесс:**

- Автоматическая инициализация сделок при создании в Bitrix24
- Настройка полей и значений по умолчанию
- Подготовка данных для фронтенда

---

### 3.6. Модуль Webhooks (`hooks`)

#### 3.6.1. Эндпоинты

**POST `/hooks/alfa/activity`**

- **Описание**: Обработка webhook от Bitrix24 для создания активностей
- **Контроллер**: `AlfaHookController`
- **Параметры запроса (query):**
    - `companyId` - ID компании
    - `title` - Заголовок активности
    - `date` - Дата активности
    - `responsible` - Ответственный

**Процесс:**

1. Получение webhook от Bitrix24
2. Извлечение данных из запроса
3. Создание активности через `AlfaActivityHookService`
4. Возврат результата

---

## 4. WebSocket коммуникация

### 4.1. Архитектура WebSocket

**Backend:**

- **Gateway**: `WsGateway` (Socket.IO)
- **Service**: `WsService` - базовый сервис для отправки сообщений
- **Events Service**: `WsEventsService` - сервис для типизированных событий
- **Events Enum**: `WsEvents` - перечисление типов событий

**Frontend:**

- **Client**: `WSClient` из `@workspace/ws`
- **Handlers Registry**: `ws-handlers-registry.ts` - регистрация обработчиков
- **Redux Integration**: WebSocket события обрабатываются через Redux listeners

### 4.2. Типы WebSocket событий

```typescript
enum WsEvents {
    // Общие события задач
    TaskCompleted = 'task.completed',
    TaskFailed = 'task.failed',
    TaskProgress = 'task.progress',
    TaskStarted = 'task.started',

    // События документов
    DocumentNumberGenerated = 'document-number:done',
    DocumentGenerated = 'document:generated',
    DocumentFailed = 'document:failed',

    // События заказов
    OrderCreated = 'order.created',
    OrderUpdated = 'order.updated',
    OrderFailed = 'order.failed',
    OrderCompleted = 'order.completed',

    // События отчетов
    ReportReady = 'report.ready',
    ReportFailed = 'report.failed',
    ReportProgress = 'report.progress',

    // События компаний
    CompanyUpdated = 'company.updated',
    CompanyUpdateFailed = 'company.update.failed',

    // События активностей
    ActivityProcessed = 'activity.processed',
    ActivityFailed = 'activity.failed',

    // Системные события
    ConnectionEstablished = 'connection.established',
    ConnectionLost = 'connection.lost',
    Error = 'error',
    Notification = 'notification',
}
```

### 4.3. Использование WebSocket

**Отправка события с бэкенда:**

```typescript
// Прямая отправка по socketId
wsService.sendToClient(socketId, {
    event: 'document-generate:done',
    data: { ...result },
});

// Через WsEventsService (типизированно)
wsEventsService.emit(
    WsEvents.DocumentNumberGenerated,
    { prefix, counter },
    { socketId, dealId: dealId.toString() },
);
```

**Обработка на фронтенде:**

```typescript
// Регистрация обработчика
registerWSHandler('document-generate:done', (data, dispatch) => {
    dispatch(documentActions.setGenerated(data));
});

// Инициализация обработчиков
initWSHandlers(dispatch);
```

---

## 5. Система очередей (Bull Queue)

### 5.1. Очереди

**Очередь `DOCUMENT`:**

- **Назначение**: Генерация документов
- **Процессор**: `DocumentGenerateQueueProcessor`
- **Задачи**: `DOCUMENT_GENERATE`

**Очередь `DOCUMENT_NUMBER`:**

- **Назначение**: Генерация номеров документов по сделке
- **Процессор**: `DocumentNumberQueueProcessor`
- **Задачи**: `DOCUMENT_NUMBER`

**Очередь `DOCUMENT_NUMBER_BY_PREFIX`:**

- **Назначение**: Генерация номеров документов по префиксу
- **Процессор**: `DocumentNumberByPrefixQueueProcessor`
- **Задачи**: `DOCUMENT_NUMBER_BY_PREFIX`

### 5.2. Диспетчер очередей

**Сервис**: `QueueDispatcherService`

- Метод `dispatch(queueName, jobName, data)` - добавление задачи в очередь
- Поддержка различных очередей через enum `QueueNames`
- Поддержка различных типов задач через enum `JobNames`

### 5.3. Redis

- Используется как брокер сообщений для Bull
- Хранит состояние очередей
- Конфигурация через переменные окружения:
    - `REDIS_HOST` - хост Redis
    - `REDIS_PORT` - порт Redis

---

## 6. Библиотека Bitrix (`@workspace/bitrix`)

### 6.1. Структура библиотеки

```
packages/bitrix/src/
├── bitrix.service.ts          # Основной сервис
├── core/                       # Ядро библиотеки
│   ├── base/                   # Базовые API методы
│   ├── domain/                 # Доменные константы и типы
│   ├── interface/              # Интерфейсы
│   └── queue/                  # Очереди для batch запросов
└── domain/                     # Доменные сервисы
    ├── activity/               # Активности
    ├── catalog/                # Каталог товаров
    ├── crm/                    # CRM сущности
    │   ├── deal/               # Сделки
    │   ├── company/            # Компании
    │   ├── contact/            # Контакты
    │   ├── product-row/        # Товарные позиции
    │   ├── timeline/           # Timeline
    │   └── ...
    ├── file/                   # Файлы
    ├── list/                   # Списки
    └── ...
```

### 6.2. Основные возможности

**BitrixService:**

- Инициализация с доменом и токеном
- Batch запросы для оптимизации
- Типизированные методы для всех сущностей

**Доменные сервисы:**

- `BxDealService` - работа со сделками
- `BxCompanyService` - работа с компаниями
- `BxContactService` - работа с контактами
- `BxProductService` - работа с товарами
- `BxProductRowService` - работа с товарными позициями
- `BxTimelineService` - работа с Timeline
- `BxActivityService` - работа с активностями
- `BxFileService` - работа с файлами
- `BxListService` - работа со списками

**Особенности:**

- Поддержка batch запросов для массовых операций
- Типизация всех запросов и ответов
- Обработка ошибок
- Кэширование (опционально)

### 6.3. Использование

```typescript
// Инициализация через PBXService
const { bitrix } = await pbxService.init('alfacentr.bitrix24.ru');

// Получение сделки
const deal = await bitrix.deal.get(dealId);

// Обновление сделки
await bitrix.deal.update(dealId, { TITLE: 'Новое название' });

// Batch запросы
bitrix.deal.batch.add('get', { id: dealId });
bitrix.deal.batch.add('update', { id: dealId, fields: {...} });
const result = await bitrix.api.callBatchWithConcurrency(1);
```

---

## 7. Frontend архитектура (FSD)

### 7.1. Слои FSD

**app/** - Инициализация приложения

- `model/store.ts` - Redux store
- `lib/app-init/` - инициализация приложения
- `ui/App.tsx` - корневой компонент

**pages/** - Страницы приложения

- `MainPage/` - главная страница
- Другие страницы приложения

**widgetes/** - Виджеты (композитные блоки)

- `Participant/` - виджет участников
- `ProductsTable/` - таблица товаров
- `ContractPreview/` - превью договора
- `SummaryPanel/` - итоговая панель

**features/** - Бизнес-функции

- `contract-type/` - выбор типа договора
- `document-rq/` - реквизиты документов
- `document-number/` - нумерация документов
- `participant-product/` - участники и товары
- `communications/` - коммуникации

**entities/** - Бизнес-сущности

- `deal/` - Redux slice для сделок
- `participant/` - участники
- `product/` - товары

**shared/** - Переиспользуемые компоненты

- `Websocket/` - WebSocket клиент и обработчики
- `Cards/` - карточки
- UI компоненты

**process/** - Бизнес-процессы

- `document/` - процесс генерации документов
    - `model/DocumentSlice.ts` - Redux slice
    - `model/DocumentThunk.ts` - async thunks
    - `model/listeners/WsListener.ts` - WebSocket listeners

### 7.2. Redux Store

**Структура:**

```typescript
{
  app: AppState,                    // Состояние приложения
  deal: DealState,                  // Состояние сделки
  participant: ParticipantState,    // Участники
  product: ProductState,            // Товары
  document: DocumentState,         // Документы
  contractType: ContractTypeState,  // Тип договора
  documentRq: DocumentRqState,      // Реквизиты документов
  documentNumber: DocumentNumberState, // Номера документов
  // ... другие слайсы
}
```

**Middleware:**

- `listenerMiddleware` - для обработки WebSocket событий
- Redux Toolkit listeners для реактивности

### 7.3. Интеграция с Bitrix24

**Инициализация:**

- Приложение встраивается в Bitrix24 через iframe
- Используется `@bitrix24/b24jssdk` для работы с Bitrix API
- Получение данных о пользователе, компании, сделке

**Роутинг:**

- `/bitrix/*` - страницы для Bitrix24
- `/no-company` - страница без компании
- `/none-auth` - страница без авторизации

---

## 8. Docker и развертывание

### 8.1. Docker Compose

**Сервисы:**

- `front-alfacentr` - Frontend приложение (Next.js)
- `api-alfacentr` - Backend приложение (NestJS)
- `redis-alfacentr` - Redis для очередей

**Конфигурация:**

```yaml
services:
    front-alfacentr:
        build:
            dockerfile: docker/Dockerfile.front
        ports:
            - '${PORT_ALFA}:3000'
        environment:
            - IN_BITRIX=true

    api-alfacentr:
        build:
            dockerfile: docker/Dockerfile.back
        ports:
            - '${PORT_API_ALFA}:3000'
        environment:
            - REDIS_HOST=redis-alfacentr
            - REDIS_PORT=6379
        depends_on:
            - redis-alfacentr
        volumes:
            - ./apps/back/storage:/app/storage
            - ./apps/back/keys:/app/keys

    redis-alfacentr:
        image: redis:7
        ports:
            - '${ALFA_REDIS_PORT}:6379'
```

### 8.2. Переменные окружения

**Backend:**

- `NODE_ENV` - окружение (production/development)
- `REDIS_HOST` - хост Redis
- `REDIS_PORT` - порт Redis
- `PORT` - порт приложения

**Frontend:**

- `IN_BITRIX` - флаг работы в Bitrix24

---

## 9. Процесс генерации документов (детально)

### 9.1. Поток генерации

1. **Получение запроса** → `DocumentGenerateController.generateDocument()`
2. **Добавление в очередь** → `QueueDispatcherService.dispatch(DOCUMENT, DOCUMENT_GENERATE, dto)`
3. **Обработка в процессоре** → `DocumentGenerateQueueProcessor.handle()`
4. **Выполнение Use Case** → `DocumentBitrixGenerateUseCase.generateDocumentAndPushToBx()`
5. **Генерация документов** → `DocumentGenerateFlowService.generateDocument()`

### 9.2. Этапы генерации

**Этап 1: Подготовка данных**

- Инициализация Bitrix сервиса
- Получение данных сделки
- Подготовка полей договора через `DocumentContractFieldsService`

**Этап 2: Генерация DOCX**

- `DocumentGenerateDocService.generateDocumentsBtch()`
- Использование шаблонов документов
- Заполнение полей через `docxtemplater`
- Поддержка различных типов документов (договор, счет, акт)

**Этап 3: Конвертация в PDF**

- `DocumentGeneratePdfService.pdfGenerate()`
- Использование LibreOffice (через сервис или внешний процесс)
- Сохранение PDF файлов

**Этап 4: Генерация ППК заявки (если требуется)**

- `PpkApplicationGenerateService.getPpkApplicationFile()`
- Генерация заявки на основе данных участников
- Сохранение в Bitrix24

**Этап 5: Отправка в Bitrix24**

- `BxBatchDocumentSendService` - batch отправка файлов
- Прикрепление к сделке
- Создание записей в Timeline через `BxTimelineService`

**Этап 6: Отправка Email (если требуется)**

- `EmailService.send()`
- Формирование письма с документами
- Отправка через Bitrix24 API или внешний сервис

**Этап 7: WebSocket уведомление**

- Отправка события `document-generate:done` клиенту
- Передача информации о сгенерированных файлах

### 9.3. Шаблоны документов

**Договоры:**

- Шаблон ID: 133, 134, 135 (в зависимости от типа)
- Поля: клиент, шапка, текст договора, сумма, подпись и т.д.

**Счета:**

- Шаблон ID: 136, 138, 148
- Поля: реквизиты для счета

**Акты:**

- Шаблон ID: 140
- Поля: реквизиты, подпись клиента, наименование компании, инициалы директора

---

## 10. Дополнительные модули

### 10.1. Модуль Telegram уведомлений

**Сервис**: `TelegramService`

- Отправка уведомлений о важных событиях
- Используется для мониторинга генерации документов
- Логирование ошибок

### 10.2. Модуль хранения файлов

**Сервис**: `StorageService`

- Работа с AWS S3
- Загрузка и скачивание файлов
- Управление путями хранения

### 10.3. Модуль PBX (Портальный сервис)

**Сервис**: `PBXService`

- Инициализация Bitrix сервиса для домена
- Управление подключениями к различным порталам
- Кэширование подключений

---

## 11. Безопасность

### 11.1. Аутентификация

- Интеграция с Bitrix24 через webhook токены
- Проверка домена и токена в каждом запросе
- Использование `BitrixHookDto` для валидации

### 11.2. Валидация данных

- Использование `class-validator` для DTO
- Валидация всех входящих данных
- Обработка ошибок валидации

---

## 12. Мониторинг и логирование

### 12.1. Логирование

- Winston для структурированного логирования
- Разные уровни логирования (info, error, warn)
- Сохранение логов в файлы

### 12.2. Мониторинг

- Prometheus метрики
- Loki для сбора логов
- Promtail для отправки логов в Loki
- Health check эндпоинты

---

## 13. Тестирование

### 13.1. Backend

- Jest для unit тестов
- E2E тесты через Supertest
- Тестовые конфигурации в `test/`

### 13.2. Frontend

- TypeScript для статической проверки типов
- ESLint для проверки кода

---

## 14. Разработка и сборка

### 14.1. Monorepo

- Использование pnpm workspaces
- Turbo для ускорения сборки
- Общие пакеты в `packages/`

### 14.2. Скрипты

**Backend:**

- `pnpm dev` - запуск в режиме разработки
- `pnpm build` - сборка
- `pnpm start:prod` - запуск production

**Frontend:**

- `pnpm dev` - запуск в режиме разработки (порт 5000)
- `pnpm build` - сборка
- `pnpm start` - запуск production

---

## 15. Заключение

Данное приложение представляет собой полнофункциональную систему для автоматизации бизнес-процессов компании, интегрированную с Bitrix24. Оно обеспечивает:

- Автоматическую генерацию юридических документов
- Удобный интерфейс для работы с документами
- Real-time обновления через WebSocket
- Надежную обработку задач через очереди
- Масштабируемую архитектуру

Архитектура построена на современных технологиях и best practices, что обеспечивает поддерживаемость и расширяемость системы.
