import { bitrixInit } from '@/modules/app/lib/bitrix-init/bitrix-init.util';
import {
    AlfaParticipantSmartItemUserFieldsEnum,
    EntityTypeIdEnum,
    getParticipant,
    IAlfaParticipantSmartItem,
    IParticipant,
    IParticipantField,
} from '@alfa/entities';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { validateApiResponse } from '@/modules/app/lib/thunk-error-handler';
import { Bitrix } from '@bitrix/bitrix';
import { IBXItem } from '@bitrix/domain/crm/item/interface/item.interface';
import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { BxParticipantService } from '../lib/service/bx-participant.service';
import { BxItemParticipantService } from '../lib/service/bx-item-participant.service';

export const fetchParticipants = createAsyncThunk<
    IParticipant[],
    string,
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>(
    'participant/fetchParticipants',
    async (dealId: string, { rejectWithValue }) => {
        try {
            const bitrix = Bitrix.getService();
            const partisipantService = new BxParticipantService();
            await partisipantService.getParticipantsComand(dealId);
            const totalBxResponse = await bitrix.api.callBatch();
            const validResponse = validateApiResponse(
                totalBxResponse.participants,
                'Ошибка получения участников: пустой ответ от сервера',
            );
            const validItems = validateApiResponse(
                validResponse.items,
                'Ошибка получения участников: отсутствуют данные в ответе',
            );
            const items = validItems.items;
            const participants =
                partisipantService.getParticipantsFrommItems(items);

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
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при получении участников';
            return rejectWithValue(errorMessage);
        }
    },
);

// Санк для обновления участника
export const updateParticipant = createAsyncThunk<
    IParticipant,
    void,
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>('participant/updateParticipant', async (_, { dispatch, getState, extra }) => {
    try {
        // const { participantId, fields } = payload;
        const editable = getState().participant.editable;

        if (!editable) {
            throw new Error('Нет данных для редактирования участника');
        }
        const participantId = editable.id;
        const fields = editable.fields;
        const service = new BxItemParticipantService();
        const itemFields = {} as { [key: string]: any };

        for (const field of fields) {
            itemFields[field.bitrixId] = field.value;
        }

        const bxResult = await service.updateParticipant(
            participantId,
            itemFields,
        );

        // Имитация успешного обновления
        const updatedParticipant = getParticipant(
            bxResult as IAlfaParticipantSmartItem,
        );

        return updatedParticipant;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : 'Неизвестная ошибка при обновлении участника',
        );
    }
});

// Санк для удаления участника
export const deleteParticipant = createAsyncThunk<
    number,
    number,
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>(
    'participant/deleteParticipant',
    async (participantId, { dispatch, getState, extra }) => {
        try {
            const service = new BxItemParticipantService();
            const bxResult = await service.deleteParticipant(participantId);

            return participantId;
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при удалении участника',
            );
        }
    },
);

export const addParticipant = createAsyncThunk<
    IParticipant,
    Partial<IParticipantField<AlfaParticipantSmartItemUserFieldsEnum>>,
    {
        dispatch: AppDispatch;
        state: RootState;
        extra: ThunkExtraArgument;
    }
>(
    'participant/addParticipant',
    async (fields, { dispatch, getState, extra }) => {
        try {
            const service = new BxItemParticipantService();
            const bxResult = await service.addParticipant(fields);
            const addedItem = getParticipant(
                bxResult as IAlfaParticipantSmartItem,
            );

            return addedItem;
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? error.message
                    : 'Неизвестная ошибка при добавлении участника',
            );
        }
    },
);
