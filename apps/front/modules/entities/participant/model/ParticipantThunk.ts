import { bitrixInit } from "@/modules/app/lib/bitrix-init/bitrix-init.util";
import { EntityTypeIdEnum, getParticipant, IAlfaParticipantSmartItem } from "@alfa/entities";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { bxAPI } from "@workspace/api";
import { TESTING_DOMAIN } from "@/modules/app/consts/app-global";
import { validateApiResponse } from "@/modules/app/lib/thunk-error-handler";

export const fetchParticipants = createAsyncThunk(
    'participant/fetchParticipants',
    async (dealId: string, { rejectWithValue }) => {
        try {
            const domain = TESTING_DOMAIN
            const response = await bxAPI.getProtectedMethod(
                'crm.item.list',
                {
                    entityTypeId: EntityTypeIdEnum.PARTICIPANT,
                    filter: {
                        parentId2: dealId
                    }
                },
                domain
            )
            
            // Проверяем различные случаи ошибок с помощью утилиты
            const validResponse = validateApiResponse(response, 'Ошибка получения участников: пустой ответ от сервера')
            const validItems = validateApiResponse(validResponse.items, 'Ошибка получения участников: отсутствуют данные в ответе')
            
            
            const participants = validItems.map((participant: IAlfaParticipantSmartItem) => getParticipant(participant))
            
            return participants;
        } catch (error) {
            // Обрабатываем сетевые ошибки и другие исключения
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при получении участников'
            return rejectWithValue(errorMessage)
        }
    }
);