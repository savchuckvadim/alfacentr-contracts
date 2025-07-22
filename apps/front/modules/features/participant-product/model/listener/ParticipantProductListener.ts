'use client';
import { RootState } from '@/modules/app/model/store';
import {
    addParticipant,
    deleteParticipant,
    fetchParticipants,
    fetchProducts,
    setFetchedProducts,
    setParticipants,
    updateParticipant,
} from '@/modules/entities';
import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { PpkDistributorService } from '../../lib/service/ppk-distributor.service';
import { getParticipantFieldValue } from '@/modules/entities/participant/lib/utils/get-participant-field-value.util';
import { BxParticipantsDataKeys } from '@alfa/entities';
import { setParticipantPpk } from '../../model/slice/ParticipantProductSlice';
import { serializeMap } from '../../lib/utils/serialize-map.util';
import { IParticipantPpk } from '../../type/participant-ppk.type';

// export const participantProductListener = createListenerMiddleware();
export function setupParticipantProductListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    // Основной listener для отслеживания изменений в products
    listenerMiddleware.startListening({
        // Слушаем любые действия, которые изменяют products
        matcher: isAnyOf(
            // setProducts,
            setFetchedProducts,
            fetchProducts.fulfilled,
            setParticipants,

            fetchParticipants.fulfilled,
            updateParticipant.fulfilled,
            addParticipant.fulfilled,
            deleteParticipant.fulfilled,
        ),
        effect: async (action, listenerApi) => {
            // Получаем текущее состояние
            const state = listenerApi.getState() as RootState;

            // Получаем обновленные продукты
            const products = state.product.items;
            const participants = state.participant.items;

            if (
                products.length > 0 &&
                participants &&
                participants.length > 0
            ) {
                const ppkDistributor = new PpkDistributorService(
                    participants,
                    products,
                );
                const result = ppkDistributor.distribute();

                if (result.unassignedParticipants.length > 0) {
                    console.warn('🙅 Участники без мест:');
                    result.unassignedParticipants.forEach(u =>
                        console.warn(
                            `- ${u.id} ${getParticipantFieldValue(u, BxParticipantsDataKeys.name)}`,
                        ),
                    );
                }
                const serializedResult: IParticipantPpk = {
                    participantsPpkTopicsStats:
                        result.participantsPpkTopicsStats,
                    participantToProducts: serializeMap(
                        result.participantToProducts,
                    ),
                    productToParticipants: serializeMap(
                        result.productToParticipants,
                    ),
                    topicStats: result.topicStats,
                    unassignedParticipants: result.unassignedParticipants,
                };

                // Можно диспатчить дополнительные действия
                listenerApi.dispatch(setParticipantPpk(serializedResult));
            }
        },
    });
}
