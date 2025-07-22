export enum WsEvents {
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
