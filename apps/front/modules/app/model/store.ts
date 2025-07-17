import { Action, AnyAction, combineReducers, configureStore, createListenerMiddleware, Dispatch, Middleware, MiddlewareAPI, ThunkAction } from "@reduxjs/toolkit";
import { appReducer } from "./AppSlice";

import { errorHandler } from "../lib/error-handler";
import { dealReducer, participantReducer, productReducer } from "@/modules/entities";
import { bxrqReducer } from "@workspace/bx-rq";
import { contractTypeReducer, contractTypeListener, clientTypeListener, documentParagraphReducer, documentParagraphProductParticipantListener } from "@/modules/features";
import {  participantProductReducer } from "@/modules/features/";
import { documentRqReducer, rqListener } from "@/modules/features/document-rq";
import { appListener } from "@/modules/entities/bx-rq/model/listener/AppListener";
import { WSClient } from "@/modules/shared/Websocket/ws-client";
import { WSClient as WSClientWorkspace } from "@workspace/ws";
import { setupParticipantProductListener } from "@/modules/features/participant-product/model/listener/ParticipantProductListener";
import { setupWsDocumentListener } from "@/modules/process/document/model/listeners/WsListener";



export const listenerMiddleware = createListenerMiddleware();


// const socketMiddleware: Middleware = (storeAPI: MiddlewareAPI) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
//   // Место для обработки действий или взаимодействия с сокетом
//   return next(action);
// };

// export const initWSClient = (userId: number, domain: string) => {
//   wsClient = new WSClient(userId, domain);
//   return wsClient;
// };

// export const getWSClient = () => {
//   if (!wsClient) throw new Error('WSClient not initialized');
//   return wsClient;
// };

const rootReducer = combineReducers({
  app: appReducer,
  participant: participantReducer,
  product: productReducer,
  deal: dealReducer,
  bxrq: bxrqReducer,

  // features
  contractType: contractTypeReducer,
  participantProduct: participantProductReducer,
  documentRq: documentRqReducer,
  documentParagraph: documentParagraphReducer,
  //april


});



// Middleware для обработки ошибок
const errorMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('Redux Error:', error);
    // Обрабатываем ошибку через ErrorHandler
    errorHandler.handleAsyncError(error);
    return next(action);
  }
};

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { getWSClient: WSClient.getClient },
        },
      })
        .concat(errorMiddleware)
        .concat(listenerMiddleware.middleware)
        .concat(contractTypeListener.middleware)
        .concat(clientTypeListener.middleware)
        // .concat(participantProductListener.middleware)
        .concat(documentParagraphProductParticipantListener.middleware)

        .concat(rqListener.middleware)
        .concat(appListener.middleware)
        // .concat(wsDocumentListener.middleware)

    // .concat(portalAPI.middleware)
    // .concat(infoblockAPI.middleware)

    // .concat(reportMiddleware)
  });
};

//listeners
// portalListener();
setupParticipantProductListener(listenerMiddleware);
setupWsDocumentListener(listenerMiddleware);
// Тип для extraArgument
export type ThunkExtraArgument = {
  getWSClient: () => WSClientWorkspace;
};

// Тип для thunk
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  ThunkExtraArgument,
  Action<string>
>;

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppGetState = AppStore["getState"];

export const store = setupStore();

//@ts-ignore
// window.eventStore = store;

