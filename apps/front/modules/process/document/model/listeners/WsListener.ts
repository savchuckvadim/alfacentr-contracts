import {
    createListenerMiddleware,
    isAnyOf,
    ListenerMiddlewareInstance,
} from '@reduxjs/toolkit';

import { wsInit } from '@/modules/app/model/queue-ws-ping-test/QueueWsPingListener';
import { DocumentGenerateOwnService } from '../../lib/services/document-generate-own.service';
import { WSClient as WSClientWorkspace } from '@workspace/ws';

export function setupWsDocumentListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening({
        matcher: isAnyOf(wsInit.fulfilled),

        effect: async (action, listenerApi) => {
            console.log(action);

            const { userId, domain, socketId } = action.payload as {
                userId: number;
                domain: string;
                socketId: string;
            };
            // const { getWSClient } = listenerApi.extra as { getWSClient: () => WSClientWorkspace }
            // const wsClient = getWSClient()
            // wsClient.on('document-generate:done', (data) => {
            //     console.log(data)
            // })

            const service = new DocumentGenerateOwnService();
            await service.registerDocumentWSHandlers();

            // socket.socket.emit('document-generate:done', {
            //     socketId,
            //     userId,
            //     domain
            // })
        },
    });
}
