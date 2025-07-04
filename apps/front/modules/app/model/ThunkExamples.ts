import { createAsyncThunk } from "@reduxjs/toolkit"
import { AppDispatch, RootState, ThunkExtraArgument } from "./store"

// Пример 1: Базовый санк с типизацией
export const basicThunk = createAsyncThunk<
    string, // ReturnType - что возвращает санк
    { id: number }, // Arg - что принимает санк
    {
        dispatch: AppDispatch
        state: RootState
        extra: ThunkExtraArgument
    }
>('app/basicThunk',
    async (payload, { dispatch, getState, extra }) => {
        const state = getState()
        const { getWSClient } = extra
        
        // Используем payload
        console.log('Payload:', payload.id)
        
        // Используем state
        const appState = state.app
        console.log('App state:', appState)
        
        // Используем dispatch для вызова других действий
        // dispatch(someOtherAction())
        
        // Используем WebSocket клиент
        const wsClient = getWSClient()
        
        return "Success"
    }
)

// Пример 2: Санк без параметров
export const noParamsThunk = createAsyncThunk<
    void,
    void,
    {
        dispatch: AppDispatch
        state: RootState
        extra: ThunkExtraArgument
    }
>('app/noParamsThunk',
    async (_, { dispatch, getState, extra }) => {
        const state = getState()
        const { getWSClient } = extra
        
        // Ваша логика здесь
        console.log('State:', state)
    }
)

// Пример 4: Санк с условной логикой на основе состояния
export const conditionalThunk = createAsyncThunk<
    boolean,
    void,
    {
        dispatch: AppDispatch
        state: RootState
        extra: ThunkExtraArgument
    }
>('app/conditionalThunk',
    async (_, { dispatch, getState, extra }) => {
        const state = getState()
        const { getWSClient } = extra
        
        // Проверяем состояние перед выполнением
        if (state.app.isLoading) {
            console.log('App is already loading, skipping...')
            return false
        }
        
        // Если не загружается, выполняем логику
        console.log('Executing logic...')
        return true
    }
)

// Пример 5: Санк с цепочкой действий
export const chainThunk = createAsyncThunk<
    void,
    void,
    {
        dispatch: AppDispatch
        state: RootState
        extra: ThunkExtraArgument
    }
>('app/chainThunk',
    async (_, { dispatch, getState, extra }) => {
        const state = getState()
        const { getWSClient } = extra
        
        // Выполняем цепочку действий
        console.log('Step 1: Starting chain')
        
        // Можем диспатчить другие санки
        // await dispatch(basicThunk({ id: 1 }))
        
        console.log('Step 2: Chain completed')
    }
) 