import { appActions } from './AppSlice';
import {
    AppDispatch,
    AppGetState,
    AppThunk,
    listenerMiddleware,
} from './store';

import { appInit } from '../lib/app-init/app-init.util';
import { startStoreListeners } from './listeners/start-store-listeners';

export const initial =
    (): AppThunk =>
    async (dispatch: AppDispatch, getState: AppGetState, { getWSClient }) => {
        const state = getState();
        const app = state.app;
        const isLoading = app.isLoading;

        if (!isLoading) {
            startStoreListeners(listenerMiddleware);

            dispatch(appActions.loading({ status: true }));
            appInit(dispatch, getState, getWSClient, () => {
                dispatch(appActions.loading({ status: false }));
            });
           
        }
    };

export const reloadApp =
    (): AppThunk =>
    async (dispatch: AppDispatch, getState: AppGetState, { getWSClient }) => {
        const state = getState();
        const app = state.app;
        const isReloading = app.isReloading;

        if (!isReloading) {
            dispatch(appActions.reloading({ status: true }));
            appInit(dispatch, getState, getWSClient, () => {
                dispatch(appActions.reloading({ status: false }));
            });
        }
    };
