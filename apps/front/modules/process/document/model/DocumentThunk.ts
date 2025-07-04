import { AppDispatch, AppGetState, RootState, ThunkExtraArgument } from "@/modules/app/model/store"
import { Bitrix } from "@bitrix/bitrix"
import { BitrixOwnerTypeId } from "@bitrix/domain"
import { createAsyncThunk } from "@reduxjs/toolkit"

// Новый стиль санков с extraArgument
export const documentGenerate = createAsyncThunk<
    number, // ReturnType
    void, // Arg
    {
        dispatch: AppDispatch
        state: RootState
        extra: ThunkExtraArgument
    }
>('document/generate',
    async (_, { dispatch, getState, extra }) => {
        // Получаем dispatch и state из деструктуризации
        const state = getState()
        const { getWSClient } = extra

        const dealId = state.app.bitrix.deal?.ID

        const bitrix = Bitrix.getService()
        debugger
        const generateDocumentData = {
            templateId: 118,
            entityId: dealId,
            entityTypeId: BitrixOwnerTypeId.DEAL,
            // providerClassName: 'Bitrix\\DocumentGenerator\\DataProvider\\Rest',
            value: 1,
            stampsEnabled: 1,
            values: {
                'UfCrm81700582664': 'TEST',
                'AlfaDocumentNumber': 'TEST',
                'Header': 'YWN0aW9uPWNybS5kb2N1bWVudGdlbmVyYXRvci5kb2N1bWVudC5kb3dubG9hZCZTSVRFX0lEPXMxJmlkPTM2ODMyJl89clNlU3B1MDNSVkdvanBwZHpIaGw4cUt2SlBGQTN1UDI%3D%7CImNybS5kb2N1bWVudGdlbmVyYXRvci5kb2N1bWVudC5kb3dubG9hZHxjcm18WVdOMGFXOXVQV055YlM1a2IyTjFiV1Z1ZEdkbGJtVnlZWFJ2Y2k1a2IyTjFiV1Z1ZEM1a2IzZHViRzloWkNaVFNWUkZYMGxFUFhNeEptbGtQVE0yT0RNeUpsODljbE5sVTNCMU1ETlNWa2R2YW5Cd1pIcElhR3c0Y1V0MlNsQkdRVE4xVURJPXw1MDJ8M29xeWV1YjltejRnN21xbCI%3D.O7oxh%2BKCQFzc94c9jf30Q1hnfjcfy7ifPfdFgVxxLEs%3D'
              
            }
        }
        debugger
        const response = await bitrix.api.call<number>('crm.documentgenerator.document.add', generateDocumentData)
        debugger
        return response.result
    })

// Пример использования dispatch и state
export const documentGenerateWithState = createAsyncThunk<
    { success: boolean }, // ReturnType
    any, // Arg
    {
        dispatch: AppDispatch
        state: RootState
        extra: ThunkExtraArgument
    }
>('document/generateWithState',
    async (payload: any, { dispatch, getState, extra }) => {
        const state = getState()
        const { getWSClient } = extra

        // Получаем данные из состояния
        const appState = state.app
        const participantState = state.participant

        // Можем диспатчить другие действия
        // dispatch(someOtherAction())

        // Используем WebSocket клиент
        const wsClient = getWSClient()

        // Ваша логика здесь
        return { success: true }
    })
