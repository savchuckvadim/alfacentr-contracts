import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { setupContractTypeListener } from '@/modules/features/contract-type/model/listener/ContractTypeListener';
import { setupClientTypeListener } from '@/modules/features/client-type/model/ClientTypeListener';
import { setupDocumentParagraphProductParticipantListener } from '@/modules/features/document-paragraph/model/listener/DocumentParagraphProductParticipantListener';
import { setupRqListener } from '@/modules/features/document-rq/model/listener/rqListener';
import { setupParticipantProductListener } from '@/modules/features/participant-product/model/listener/ParticipantProductListener';
import { setupWsDocumentListener } from '@/modules/process/document/model/listeners/WsListener';
import { setupDocumentNumberListener } from '@/modules/features/document-number/model/listener/DocumentNumberListener';
import { setupWsInitListener } from '@/modules/app/model/queue-ws-ping-test/QueueWsPingListener';
import {
    setupAppDealEdoCommentListener,
    setupCommunicationsDealListener,
    setupParticipantSeminarDaysListener,
} from '@/modules/features';
import { setupDocumentDealListener } from '@/modules/process/document/model/listeners/DealListener';
import {
    setupCurrentRqListener,
    setupRqAppListener,
} from '@/modules/entities/bx-rq';
import { setupAppDealActDateListener } from '@/modules/features/deal-act-date/model/listener/app.deal-act-date.listener';

export function startStoreListeners(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    setupRqAppListener(listenerMiddleware);
    setupCurrentRqListener(listenerMiddleware);
    setupContractTypeListener(listenerMiddleware);
    setupClientTypeListener(listenerMiddleware);
    setupDocumentParagraphProductParticipantListener(listenerMiddleware);
    setupRqListener(listenerMiddleware);
    setupParticipantProductListener(listenerMiddleware);
    setupParticipantSeminarDaysListener(listenerMiddleware);
    setupWsDocumentListener(listenerMiddleware);
    setupDocumentNumberListener(listenerMiddleware);
    setupWsInitListener(listenerMiddleware);
    setupDocumentDealListener(listenerMiddleware);
    setupCommunicationsDealListener(listenerMiddleware);
    setupAppDealActDateListener(listenerMiddleware);
    setupAppDealEdoCommentListener(listenerMiddleware);
}
