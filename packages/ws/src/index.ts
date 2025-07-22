// packages/ws-client/src/index.ts
import { io, Socket } from 'socket.io-client';
export type { Socket };
// const NEXT_PUBLIC_WS_HOST = 'ws://localhost:8334'

const NEXT_PUBLIC_WS_HOST ='https://alfacentr.back.april-app.ru/'

// const NEXT_PUBLIC_WS_HOST = 'http://localhost:3000';

export class WSClient {
    public readonly socket: Socket;

    constructor(userId: number, domain: string) {
        console.log('🔧 Creating WSClient with host:', NEXT_PUBLIC_WS_HOST);
        this.socket = io(NEXT_PUBLIC_WS_HOST, {
            transports: ['websocket'],
            autoConnect: true,
            // auth: {
            //     userId,            // получено с клиента
            //     domain // тоже
            // }
        });

        // Добавляем обработчики подключения
        this.socket.on('connect', () => {
            console.log('🔧 WebSocket connected, ID:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('🔧 WebSocket disconnected');
        });

        this.socket.on('connect_error', error => {
            console.error('🔧 WebSocket connection error:', error);
        });
    }

    on(event: string, callback: (...args: any[]) => void) {
        console.log(
            '🔧 Registering event listener for:',
            event,
            'Socket ID:',
            this.id,
        );
        this.socket.on(event, (...args) => {
            console.log('🔧 Received event:', event, 'with args:', args);
            callback(...args);
        });
    }

    emit(event: string, data: any) {
        console.log('✅ Socket emit connected event:', event);
        const id = this.id;
        console.log('✅ Socket emit connected:', id);
        this.socket.emit(event, data);
    }

    disconnect() {
        console.log('✅ Socket disconnect');
        const id = this.id;
        console.log('✅ Socket disconnect connected:', id);

        this.socket.disconnect();
    }

    off(event: string, hendler: (args: any) => void) {
        this.socket.off(event, hendler);
    }
    get id(): string | undefined {
        return this.socket.id;
    }
}
