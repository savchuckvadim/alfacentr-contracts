import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { wsInit } from "@/modules/app/model/queue-ws-ping-test/QueueWsPingListener";
import { DocumentGenerateOwnService } from "../../lib/services/document-generate-own.service";
import { WSClient as WSClientWorkspace } from "@workspace/ws";


export const wsDocumentListener = createListenerMiddleware()

wsDocumentListener.startListening({
    matcher: isAnyOf(
        wsInit.fulfilled


    ),

    effect: async (action, listenerApi) => {
        console.log(action)
        


        const { socket, userId, domain, socketId } = action.payload as { socket: WSClientWorkspace, userId: number, domain: string, socketId: string }
        
        const service = new DocumentGenerateOwnService()
        await service.registerDocumentWSHandlers()
        debugger
        // socket.socket.emit('document-generate:done', {
        //     socketId,
        //     userId,
        //     domain
        // })
    }
})