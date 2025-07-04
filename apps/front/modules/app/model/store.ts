import { Action, AnyAction, combineReducers, configureStore, createListenerMiddleware, Dispatch, Middleware, MiddlewareAPI, ThunkAction } from "@reduxjs/toolkit";
import { appReducer } from "./AppSlice";
import { WSClient } from "@workspace/ws";
import { errorHandler } from "../lib/error-handler";
import { participantReducer } from "@/modules/entities";




export const listenerMiddleware = createListenerMiddleware();
let wsClient: WSClient;

// const socketMiddleware: Middleware = (storeAPI: MiddlewareAPI) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
//   // Место для обработки действий или взаимодействия с сокетом
//   return next(action);
// };

export const initWSClient = (userId: number, domain: string) => {
  wsClient = new WSClient(userId, domain);
  return wsClient;
};

export const getWSClient = () => {
  if (!wsClient) throw new Error('WSClient not initialized');
  return wsClient;
};

const rootReducer = combineReducers({
  app: appReducer,
  participant: participantReducer,

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
          extraArgument: { getWSClient }, 
        },
      })
        .concat(errorMiddleware)
        // .concat(portalAPI.middleware)
        // .concat(infoblockAPI.middleware)
 
    // .concat(reportMiddleware)
  });
};

//listeners
// portalListener();


// Тип для extraArgument
export type ThunkExtraArgument = {
  getWSClient: typeof getWSClient;
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

