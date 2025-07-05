import { bitrixInit } from "@/modules/app/lib/bitrix-init/bitrix-init.util";
import { EntityTypeIdEnum, getParticipant, IAlfaParticipantSmartItem, IParticipant } from "@alfa/entities";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { validateApiResponse } from "@/modules/app/lib/thunk-error-handler";
import { Bitrix } from "@bitrix/bitrix";
import { IBXItem } from "@workspace/bitrix";
import { AppDispatch, RootState, ThunkExtraArgument } from "@/modules/app/model/store";
import { BxParticipantService } from "../lib/hook/service/bx-participant.service";

export const fetchParticipants = createAsyncThunk<
    IParticipant[],
    string,
    {
        dispatch: AppDispatch
        state: RootState
        extra: ThunkExtraArgument
    }
>('participant/fetchParticipants',
    async (dealId: string, { rejectWithValue }) => {
        try {
            const bitrix = Bitrix.getService()
            const partisipantService = new BxParticipantService()
            await partisipantService.getParticipantsComand(dealId)
            const totalBxResponse = await bitrix.api.callBatch()
            const validResponse = validateApiResponse(totalBxResponse.participants, 'Ошибка получения участников: пустой ответ от сервера')
            const validItems = validateApiResponse(validResponse.items, 'Ошибка получения участников: отсутствуют данные в ответе')
            const items = validItems.items
            const participants = partisipantService.getParticipantsFrommItems(items)
            
            // const bitrix = Bitrix.getService()
            // const response = await bitrix.item.list(
            //     EntityTypeIdEnum.PARTICIPANT as unknown as string,
            //     {
            //         parentId2: dealId
            //     }
            // )

            // // Проверяем различные случаи ошибок с помощью утилиты
            // const validResponse = validateApiResponse(response, 'Ошибка получения участников: пустой ответ от сервера')
            // const validItems = validateApiResponse(validResponse.items, 'Ошибка получения участников: отсутствуют данные в ответе')

            // const typedParticipant = validItems.map((participant: IBXItem) => {
            //     return {
            //         ...participant,
            //         entityTypeId: EntityTypeIdEnum.PARTICIPANT as unknown as string
            //     } as unknown as IAlfaParticipantSmartItem
            // }) as IAlfaParticipantSmartItem[]

            // const participants = typedParticipant.map((participant: IAlfaParticipantSmartItem) => getParticipant(participant))
            // console.log("PARTICIPANTS ALFA", participants)

            return participants;
        } catch (error) {
            // Обрабатываем сетевые ошибки и другие исключения
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при получении участников'
            return rejectWithValue(errorMessage)
        }
    }
);

// Санк для обновления участника
// export const updateParticipant = createAsyncThunk<
//     IParticipant,
//     { participantId: number; data: Partial<IParticipant> },
//     {
//         dispatch: AppDispatch
//         state: RootState
//         extra: ThunkExtraArgument
//     }
// >('participant/updateParticipant',
//     async (payload, { dispatch, getState, extra }) => {
//         try {
//             const { participantId, data } = payload;
//             const bitrix = Bitrix.getService();

//             // Здесь будет логика обновления участника через Bitrix API
//             console.log('Обновление участника:', participantId, data);

//             // Имитация успешного обновления
//             const updatedParticipant = {
//                 id: participantId,
//                 ...data
//             } as IParticipant;

//             return updatedParticipant;
//         } catch (error) {
//             throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка при обновлении участника');
//         }
//     }
// );

// Санк для удаления участника
export const deleteParticipant = createAsyncThunk<
    number,
    number,
    {
        dispatch: AppDispatch
        state: RootState
        extra: ThunkExtraArgument
    }
>('participant/deleteParticipant',
    async (participantId, { dispatch, getState, extra }) => {
        try {
            const bitrix = Bitrix.getService();

            // Здесь будет логика удаления участника через Bitrix API
            console.log('Удаление участника:', participantId);

            // Имитация успешного удаления
            return participantId;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка при удалении участника');
        }
    }
);