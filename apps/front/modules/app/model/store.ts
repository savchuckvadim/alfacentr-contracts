import {
    Action,
    combineReducers,
    configureStore,
    createListenerMiddleware,
    Middleware,
    ThunkAction,
} from '@reduxjs/toolkit';
import { appReducer } from './AppSlice';

import { errorHandler } from '../lib/error-handler';
import {
    dealReducer,
    participantReducer,
    productReducer,
} from '@/modules/entities';
import { bxrqReducer } from '@workspace/bx-rq';
import {
    contractTypeReducer,
    dealActDateReducer,
    documentParagraphReducer,
    seminarDaysSelectReducer,
    documentNumberReducer,
    communicationsReducer,
    participantProductReducer,
    dealEdoCommentReducer,
} from '@/modules/features';

import { documentRqReducer } from '@/modules/features/document-rq';
import { WSClient } from '@/modules/shared/Websocket/ws-client';
import { WSClient as WSClientWorkspace } from '@workspace/ws';

import { documentReducer } from '@/modules/process/document/model/DocumentSlice';

export const listenerMiddleware = createListenerMiddleware();

const rootReducer = combineReducers({
    app: appReducer,
    participant: participantReducer,
    product: productReducer,
    deal: dealReducer,
    bxrq: bxrqReducer,

    // features
    contractType: contractTypeReducer,
    participantProduct: participantProductReducer,
    seminarDaysSelect: seminarDaysSelectReducer,
    documentRq: documentRqReducer,
    documentParagraph: documentParagraphReducer,
    documentNumber: documentNumberReducer,
    communications: communicationsReducer,
    dealActDate: dealActDateReducer,
    dealEdoComment: dealEdoCommentReducer,
    
    //process
    document: documentReducer,
});

// Middleware для обработки ошибок
const errorMiddleware: Middleware = storeAPI => next => action => {
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
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: { getWSClient: WSClient.getClient },
                },
            })
                .concat(errorMiddleware)
                .concat(listenerMiddleware.middleware),
    });
};

//listeners
// portalListener();
// startStoreListeners(listenerMiddleware);

// setupParticipantProductListener(listenerMiddleware);
// setupWsDocumentListener(listenerMiddleware);
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
export type AppDispatch = AppStore['dispatch'];
export type AppGetState = AppStore['getState'];

export const store = setupStore();

//@ts-ignore
// window.eventStore = store;
