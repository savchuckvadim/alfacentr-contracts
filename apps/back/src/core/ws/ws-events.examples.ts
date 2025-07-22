import { Injectable } from '@nestjs/common';
import { WsEventsService } from './ws-events.service';
import { WsEvents } from './ws-events.enum';

/**
 * Примеры использования WsEventsService
 */
@Injectable()
export class WsEventsExamples {
    constructor(private readonly wsEvents: WsEventsService) {}

    /**
     * Пример отправки события успешного выполнения задачи
     */
    exampleTaskCompleted() {
        // Отправка по socketId
        this.wsEvents.emitTaskCompleted(
            { socketId: 'socket-123' },
            { documentNumber: 'DOC-001', status: 'generated' },
        );

        // Отправка пользователю
        this.wsEvents.emitTaskCompleted(
            { userId: 'user-456' },
            { documentNumber: 'DOC-002', status: 'generated' },
        );

        // Отправка в комнату сделки
        this.wsEvents.emitTaskCompleted(
            { dealId: 'deal-789' },
            { documentNumber: 'DOC-003', status: 'generated' },
        );
    }

    /**
     * Пример отправки события ошибки
     */
    exampleTaskFailed() {
        this.wsEvents.emitTaskFailed(
            { socketId: 'socket-123', dealId: 'deal-789' },
            'Failed to generate document number',
            { errorCode: 'VALIDATION_ERROR', field: 'prefix' },
        );
    }

    /**
     * Пример отправки события прогресса
     */
    exampleTaskProgress() {
        this.wsEvents.emitTaskProgress(
            { socketId: 'socket-123' },
            75,
            'Processing document generation...',
        );
    }

    /**
     * Пример отправки кастомного события
     */
    exampleCustomEvent() {
        // Отправка события генерации документа
        this.wsEvents.emit(
            WsEvents.DocumentNumberGenerated,
            {
                documentNumber: 'DOC-001',
                prefix: 'ППК',
                dealId: 'deal-789',
            },
            {
                socketId: 'socket-123',
                dealId: 'deal-789',
            },
        );

        // Отправка события обновления компании
        this.wsEvents.emit(
            WsEvents.CompanyUpdated,
            {
                companyId: 123,
                updatedFields: ['UF_CRM_1721825948'],
                success: true,
            },
            {
                userId: 'user-456',
                dealId: 'deal-789',
            },
        );
    }

    /**
     * Пример отправки события в комнату
     */
    exampleRoomEvent() {
        this.wsEvents.emitToRoom(
            'admin-room',
            WsEvents.Notification,
            {
                type: 'info',
                message: 'New document generated',
                timestamp: new Date().toISOString(),
            },
            { dealId: 'deal-789' },
        );
    }

    /**
     * Пример отправки события всем клиентам
     */
    exampleBroadcastEvent() {
        this.wsEvents.emitToAll(
            WsEvents.Notification,
            {
                type: 'system',
                message: 'System maintenance in 5 minutes',
                timestamp: new Date().toISOString(),
            },
            { room: 'system' },
        );
    }
}

/**
 * Пример использования в контроллере
 */
export class ExampleController {
    constructor(private readonly wsEvents: WsEventsService) {}

    async handleDocumentGeneration(
        socketId: string,
        dealId: string,
        userId?: string,
    ) {
        try {
            // Логика генерации документа
            const result = await this.generateDocument();

            // Отправка события успеха
            this.wsEvents.emitTaskCompleted(
                { socketId, dealId, userId },
                result,
            );
        } catch (error) {
            // Отправка события ошибки
            this.wsEvents.emitTaskFailed(
                { socketId, dealId, userId },
                error.message,
            );
        }
    }

    private async generateDocument() {
        // Имитация генерации документа
        return { documentNumber: 'DOC-001', status: 'generated' };
    }
}

/**
 * Пример использования в процессоре очереди
 */
export class ExampleQueueProcessor {
    constructor(private readonly wsEvents: WsEventsService) {}

    async processJob(jobData: {
        socketId: string;
        dealId: string;
        userId?: string;
    }) {
        const { socketId, dealId, userId } = jobData;

        try {
            // Отправка события начала обработки
            this.wsEvents.emit(
                WsEvents.TaskStarted,
                {},
                { socketId, dealId, userId },
            );

            // Отправка прогресса
            this.wsEvents.emitTaskProgress(
                { socketId, dealId, userId },
                25,
                'Starting...',
            );

            // Логика обработки
            await this.processData();

            this.wsEvents.emitTaskProgress(
                { socketId, dealId, userId },
                50,
                'Processing...',
            );

            // Завершение
            const result = await this.finalize();

            this.wsEvents.emitTaskProgress(
                { socketId, dealId, userId },
                100,
                'Completed',
            );
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

    private async processData() {
        // Имитация обработки
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    private async finalize() {
        // Имитация финализации
        return { status: 'completed', timestamp: new Date().toISOString() };
    }
}
