import { Injectable, Logger } from '@nestjs/common';
import { WsService } from './ws.service';
import { WsEvents } from './ws-events.enum';

export interface WsEventPayload {
    event: string;
    data: any;
    metadata?: {
        userId?: string;
        dealId?: string;
        socketId?: string;
        timestamp?: number;
    };
}

export interface WsEventContext {
    userId?: string;
    dealId?: string;
    socketId?: string;
    room?: string;
}

@Injectable()
export class WsEventsService {
    private readonly logger = new Logger(WsEventsService.name);

    constructor(private readonly wsService: WsService) {}

    /**
     * Отправляет событие конкретному пользователю по userId
     */
    emitToUser(
        userId: string,
        event: string,
        payload: any,
        context?: Partial<WsEventContext>,
    ) {
        this.logger.log(`Emitting event '${event}' to user: ${userId}`);

        const eventPayload: WsEventPayload = {
            event,
            data: payload,
            metadata: {
                userId,
                dealId: context?.dealId,
                timestamp: Date.now(),
                ...context,
            },
        };

        // Отправляем в комнату пользователя
        this.wsService.emitToUser(userId, event, eventPayload);
    }

    /**
     * Отправляет событие в комнату
     */
    emitToRoom(
        room: string,
        event: string,
        payload: any,
        context?: Partial<WsEventContext>,
    ) {
        this.logger.log(`Emitting event '${event}' to room: ${room}`);

        const eventPayload: WsEventPayload = {
            event,
            data: payload,
            metadata: {
                room,
                dealId: context?.dealId,
                timestamp: Date.now(),
                ...context,
            },
        };

        this.wsService.emitToRoom(`room:${room}`, event, eventPayload);
    }

    /**
     * Отправляет событие по socketId
     */
    emitToSocket(
        socketId: string,
        event: string,
        payload: any,
        context?: Partial<WsEventContext>,
    ) {
        this.logger.log(`Emitting event '${event}' to socket: ${socketId}`);

        // Отправляем данные в формате, который ожидает клиент
        const eventPayload = {
            event,
            data: payload,
            metadata: {
                socketId,
                dealId: context?.dealId,
                timestamp: Date.now(),
                ...context,
            },
        };

        this.logger.log(`Event payload:`, eventPayload);
        this.wsService.sendToClient(socketId, eventPayload);
    }

    /**
     * Отправляет событие всем подключенным клиентам
     */
    emitToAll(event: string, payload: any, context?: Partial<WsEventContext>) {
        this.logger.log(`Broadcasting event '${event}' to all clients`);

        const eventPayload: WsEventPayload = {
            event,
            data: payload,
            metadata: {
                timestamp: Date.now(),
                ...context,
            },
        };

        this.wsService.broadcastToAll(event, eventPayload);
    }

    /**
     * Отправляет событие в комнату сделки
     */
    emitToDeal(
        dealId: string,
        event: string,
        payload: any,
        context?: Partial<WsEventContext>,
    ) {
        this.logger.log(`Emitting event '${event}' to deal: ${dealId}`);

        const eventPayload: WsEventPayload = {
            event,
            data: payload,
            metadata: {
                dealId,
                timestamp: Date.now(),
                ...context,
            },
        };

        this.wsService.emitToDeal(dealId, event, eventPayload);
    }

    /**
     * Универсальный метод для отправки событий
     */
    emit(event: WsEvents, payload: any, context: WsEventContext) {
        const { userId, dealId, socketId, room } = context;

        if (socketId) {
            this.emitToSocket(socketId, event, payload, context);
        } else if (userId) {
            this.emitToUser(userId, event, payload, context);
        } else if (dealId) {
            this.emitToDeal(dealId, event, payload, context);
        } else if (room) {
            this.emitToRoom(room, event, payload, context);
        } else {
            this.emitToAll(event, payload, context);
        }
    }

    /**
     * Отправляет событие успешного выполнения задачи
     */
    emitTaskCompleted(context: WsEventContext, result: any) {
        this.emit(
            WsEvents.TaskCompleted,
            {
                success: true,
                result,
                message: 'Task completed successfully',
            },
            context,
        );
    }

    /**
     * Отправляет событие ошибки выполнения задачи
     */
    emitTaskFailed(context: WsEventContext, error: string, details?: any) {
        this.emit(
            WsEvents.TaskFailed,
            {
                success: false,
                error,
                details,
                message: 'Task failed',
            },
            context,
        );
    }

    /**
     * Отправляет событие прогресса выполнения задачи
     */
    emitTaskProgress(
        context: WsEventContext,
        progress: number,
        message?: string,
    ) {
        this.emit(
            WsEvents.TaskProgress,
            {
                progress,
                message,
                timestamp: Date.now(),
            },
            context,
        );
    }
}
