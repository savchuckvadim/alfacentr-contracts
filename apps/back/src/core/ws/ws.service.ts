import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class WsService {
    private server: Server;
    private clients = new Map<string, Socket>();

    constructor() {}

    registerClient(client: Socket) {
        Logger.log(`registerClient: ${client.id}`);
        this.clients.set(client.id, client);
        Logger.log(
            `registerClient: total clients after registration: ${this.clients.size}`,
        );
    }

    removeClient(clientId: string) {
        Logger.log(`removeClient: ${clientId}`);
        this.clients.delete(clientId);
        Logger.log(
            `removeClient: total clients after removal: ${this.clients.size}`,
        );
    }

    setServer(server: Server) {
        this.server = server;
    }

    sendToClient(socketId: string, payload: any) {
        const client = this.clients.get(socketId);
        Logger.log(`sendToClient ${socketId}`);
        Logger.log(`sendToClient total clients: ${this.clients.size}`);
        Logger.log(`sendToClient payload:`, payload);

        if (client) {
            Logger.log(`sendToClient client+ ${socketId}`);
            Logger.log(`sendToClient client+ ${payload.event}`);
            Logger.log(`sendToClient client connected: ${client.connected}`);
            // Отправляем данные напрямую, а не payload.data
            client.emit(payload.event, payload);
            Logger.log(`sendToClient event emitted successfully`);
        } else {
            Logger.log(
                `sendToClient ERROR: Client not found for socketId: ${socketId}`,
            );
            Logger.log(
                `sendToClient available clients:`,
                Array.from(this.clients.keys()),
            );
        }
    }

    broadcast(event: string, data: any) {
        this.server.emit(event, data);
    }

    emitToAll(event: string, payload: any) {
        this.server?.emit(event, payload);
    }

    emitToClient(clientId: string, event: string, payload: any) {
        const client = this.server?.sockets.sockets.get(clientId);
        if (client) {
            client.emit(event, payload);
        }
    }

    emitToRoom(room: string, event: string, payload: any) {
        this.server?.to(room).emit(event, payload);
    }

    emitToUser(userId: string, event: string, payload: any) {
        this.server?.to(`user:${userId}`).emit(event, payload);
    }

    emitToDeal(dealId: string, event: string, payload: any) {
        this.server?.to(`deal:${dealId}`).emit(event, payload);
    }

    broadcastToAll(event: string, payload: any) {
        this.server?.emit(event, payload);
    }

    // emitToAll(event: string, payload: any) {
    //   this.gateway.server.emit(event, payload);
    // }

    // emitToClient(clientId: string, event: string, payload: any) {
    //   const client = this.gateway.server.sockets.sockets.get(clientId);
    //   if (client) client.emit(event, payload);
    // }
    // create(createWDto: CreateWDto) {
    //   return 'This action adds a new w';
    // }

    // findAll() {
    //   return `This action returns all ws`;
    // }

    // findOne(id: number) {
    //   return `This action returns a #${id} w`;
    // }

    // update(id: number, updateWDto: UpdateWDto) {
    //   return `This action updates a #${id} w`;
    // }

    // remove(id: number) {
    //   return `This action removes a #${id} w`;
    // }
}
