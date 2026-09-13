/** Каналы, через которые бот общается. Ядро знает только их имена */
export type TBotChannel = 'bitrix' | 'telegram';

/**
 * Жизненный цикл заявки.
 *
 * new — пришло обращение, ещё ничего не сделано.
 * acknowledged — в чат ушло подтверждение приёма, создана задача.
 * assigned — заявку делегировали конкретному оператору.
 * answered — оператор отправил ответ в чат.
 * ignored — оператор решил, что отвечать не нужно.
 */
export type TBotRequestStatus =
    | 'new'
    | 'acknowledged'
    | 'assigned'
    | 'answered'
    | 'ignored';

/** Обращение из чата, вокруг которого крутится вся работа бота */
export interface IBotRequest {
    id: string;
    channel: TBotChannel;
    /** Диалог источника: chatNNN для группового чата, NNN для личного */
    dialogId: string;
    messageId: string;
    authorId: number;
    authorName: string;
    text: string;
    taskId: number | null;
    status: TBotRequestStatus;
    /** Кому делегировали, идентификатор пользователя Битрикса */
    assignedOperatorId: number | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Оператор — сотрудник, который может отвечать на заявки из Телеграма.
 *
 * Связка «пользователь Битрикса — чат Телеграма» нужна в обе стороны: по
 * пользователю ищем, куда отправить карточку, по чату — кто нажал кнопку.
 */
export interface IBotOperator {
    bitrixUserId: number;
    telegramChatId: number;
    name: string;
    canAnswer: boolean;
    canDelegate: boolean;
    isActive: boolean;
    addedAt: string;
}

/**
 * Что ядро умеет требовать от канала. Канал знает про ядро, ядро про канал —
 * только через этот контракт: иначе третий канал нельзя добавить, не тронув
 * первые два.
 */
export interface IBotChannel {
    readonly channel: TBotChannel;
    /** Отправить текст в диалог источника */
    sendReply(dialogId: string, text: string): Promise<void>;
    /** Показать оператору карточку заявки. Не все каналы это умеют */
    showRequestCard?(request: IBotRequest): Promise<void>;
}
