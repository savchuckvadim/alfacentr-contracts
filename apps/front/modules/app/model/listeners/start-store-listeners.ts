import { ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { setupContractTypeListener } from "@/modules/features/contract-type/model/listener/ContractTypeListener";
import { setupClientTypeListener } from "@/modules/features/client-type/model/ClientTypeListener";
import { setupDocumentParagraphProductParticipantListener } from "@/modules/features/document-paragraph/model/listener/DocumentParagraphProductParticipantListener";
import { setupRqListener } from "@/modules/features/document-rq/model/listener/rqListener";
import { setupParticipantProductListener } from "@/modules/features/participant-product/model/listener/ParticipantProductListener";
import { setupWsDocumentListener } from "@/modules/process/document/model/listeners/WsListener";


export function startStoreListeners(listenerMiddleware: ListenerMiddlewareInstance) {
    setupContractTypeListener(listenerMiddleware);
    setupClientTypeListener(listenerMiddleware);
    setupDocumentParagraphProductParticipantListener(listenerMiddleware);
    setupRqListener(listenerMiddleware);
    setupParticipantProductListener(listenerMiddleware);
    setupWsDocumentListener(listenerMiddleware);
}
