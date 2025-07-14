import { RootState } from "@/modules/app/model/store";
import { addParticipant, deleteParticipant, fetchParticipants, fetchProducts, setFetchedProducts, setParticipants, setProducts, updateParticipant } from "@/modules/entities";
import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { PpkDistributorService } from "../../lib/service/ppk-distributor.service";
import { getParticipantFieldValue } from "@/modules/entities/participant/lib/utils/get-participant-field-value.util";
import { BxParticipantsDataKeys } from "@alfa/entities";
import { setParticipantPpk } from "../../model/slice/ParticipantProductSlice";
import { serializeMap } from "../../lib/utils/serialize-map.util";
import { IParticipantPpk } from "../../type/participant-ppk.type";


export const participantProductListener = createListenerMiddleware();

// Основной listener для отслеживания изменений в products
participantProductListener.startListening({
    // Слушаем любые действия, которые изменяют products
    matcher: isAnyOf(
        setProducts,
        setFetchedProducts,
        fetchProducts.fulfilled,
        setParticipants,
 
        fetchParticipants.fulfilled,
        updateParticipant.fulfilled,
        addParticipant.fulfilled,
        deleteParticipant.fulfilled


    ),
    effect: async (action, listenerApi) => {
        // Получаем текущее состояние
        const state = listenerApi.getState() as RootState;

        // Получаем обновленные продукты
        const products = state.product.items;
        const participants = state.participant.items;


        if (products.length > 0 && participants && participants.length > 0) {
            // Обработка обновленных продуктов
            // console.log(`Updated ${products.length} products`);
            // const participantsPpks = participants.map(participant => getParticipantWithProducts(participant, products))
            // const seminarProducts = getProductsByType(products, 'seminar')

            const ppkDistributor = new PpkDistributorService(participants, products)
            const result = ppkDistributor.distribute()
            
            // console.log(result)

            // for (const stat of result.topicStats) {
            //     console.log(`\n📘 Тема: ${stat.topic}`);
            //     console.log(`  Участников: ${stat.needed}`);
            //     console.log(`  Продуктов (quantity): ${stat.available}`);
            //     console.log(`  Разница: ${stat.diff}`);
            //     if (stat.diff < 0) console.warn(`  ⚠️ Не хватает мест!`);
            //     if (stat.diff > 0) console.warn(`  ⚠️ Лишние места!`);
            // }

            // for (const [participantId, products] of result.participantToProducts.entries()) {
            //     console.log(`\n👤 Участник ${participantId} назначен на:`);
                
            //     for (const product of products) {
            //         console.log(`  - ${product.productName}`);
            //     }
            // }
            if (result.unassignedParticipants.length > 0) {
                console.warn('🙅 Участники без мест:');
                result.unassignedParticipants.forEach(u =>
                    console.warn(`- ${u.id} ${getParticipantFieldValue(u, BxParticipantsDataKeys.name)}`)
                );
            }
            const serializedResult: IParticipantPpk = {
                participantsPpkTopicsStats: result.participantsPpkTopicsStats,
                participantToProducts: serializeMap(result.participantToProducts),
                productToParticipants: serializeMap(result.productToParticipants),
                topicStats: result.topicStats,
                unassignedParticipants: result.unassignedParticipants
            };
            
            // Можно диспатчить дополнительные действия
            listenerApi.dispatch(setParticipantPpk(serializedResult));
        }
    },
});