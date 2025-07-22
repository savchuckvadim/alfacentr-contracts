import { getProductFieldByCodeValue, IAlfaProduct } from '@/modules/entities';
import {
    BxParticipantsDataKeys,
    bxProductData,
    IParticipant,
    IParticipantField,
    AlfaParticipantSmartItemUserFieldsEnum,
} from '@alfa/entities';
import { getProductsByType } from './product.util';
import {
    IParicipantPpkThemesStats,
    ITopicStat,
    ParticipantPpkField,
} from '../../type/participant-ppk.type';

const participantPpkFieldCodes = [
    BxParticipantsDataKeys.accountant_gos,
    BxParticipantsDataKeys.accountant_medical,
    BxParticipantsDataKeys.zakupki,
    BxParticipantsDataKeys.kadry,
    BxParticipantsDataKeys.corruption,
];
export const getParticipantWithProducts = (
    participant: IParticipant,
    products: IAlfaProduct[],
) => {
    const ppkProducts = getProductsByType(products, 'ppk');

    const participantProductPpk = [] as IAlfaProduct[];

    ppkProducts?.map(product => {
        const searchedField = product.fields.find(
            field => field.bitrixId === bxProductData.SEMINAR_TOPIC.bitrixId,
        );

        if (searchedField) {
            const fieldValue = searchedField.value as { value: string };

            if (fieldValue?.value) {
                participant.fields.map(partField => {
                    if (
                        participantPpkFieldCodes.includes(
                            partField.code as BxParticipantsDataKeys,
                        )
                    ) {
                        if (partField.value == fieldValue.value) {
                            participantProductPpk.push(product);
                        } else if (partField.value.includes(fieldValue.value)) {
                            participantProductPpk.push(product);
                        } else {
                        }
                    }
                });
            }
        }
    });

    participantProductPpk;
};

export const getMissingProductsByParticipantPpkThemes = (
    programsThemes: string[],
    products: IAlfaProduct[],
): string[] => {
    const missingProducts = [] as string[];

    // products.forEach((product) => {
    //     const productTopicName = getProductFieldByCodeValue(product, 'SEMINAR_TOPIC')?.value
    //     if (!productTopicName) return
    //     const searchedProduct = programsThemes.find((program) => program.includes(productTopicName))
    //     if (!searchedProduct) missingProducts.push(product)
    // })
    programsThemes.forEach(program => {
        const searchedProduct = products.find(
            product =>
                getProductFieldByCodeValue(product, 'SEMINAR_TOPIC')?.value ==
                program,
        );
        if (!searchedProduct) missingProducts.push(program);
    });

    return missingProducts;
};

export const getParicipantPpkTopicsStats = (
    participant: IParticipant,
    topicStats: ITopicStat[],
    participantToProducts: Map<number, IAlfaProduct[]>,
): IParicipantPpkThemesStats[] | null => {
    const hasParticipantPpkTopic = topicStats.some(topic =>
        topic.participants.find(prtcpnt => prtcpnt.id === participant.id),
    );
    const productsOfParticipant =
        participantToProducts.get(Number(participant.id)) ?? undefined;
    if (!hasParticipantPpkTopic) {
        return null;
    }
    const participantPpkThemesStats: IParicipantPpkThemesStats[] = [];

    topicStats.forEach(topic => {
        const isTargetTopic = topic.participants.some(
            prtcpnt => prtcpnt.id === participant.id,
        );
        if (!isTargetTopic) {
            return;
        }

        const participantField = participant.fields.find(field =>
            field.value.includes(topic.topic),
        ) as ParticipantPpkField | undefined;

        if (!topic.products || topic.products.length === 0) {
            //у топика нет ни одного продукта
            participantPpkThemesStats.push({
                participantField: participantField,
                topic: topic.topic,
                participantId: participant.id,
                status: 'missing_ppk',
                message: 'У Темы ппк нет ни одного Товара - добавьте товар ППК',
                product: null,
                potintialProduct: null,
            });
            return;
        }

        let currentProductInTopicInParticipant = false as false | IAlfaProduct;
        topic.products.forEach(product => {
            if (productsOfParticipant) {
                //у участника есть продукты
                for (const pProduct of productsOfParticipant) {
                    //пербираем все продукты участника
                    if (product.id === pProduct.id) {
                        //одна из товарных позиций Топика равна одной из товарных позиций участника
                        currentProductInTopicInParticipant = product;
                    } else {
                        //одна из товарных позиций Топика не равна одной из товарных позиций участника
                    }
                }
            } else {
            }
        });

        if (productsOfParticipant) {
            //у участника есть продукты
            if (currentProductInTopicInParticipant) {
                //у участника есть товар ППК и он есть в топике
                participantPpkThemesStats.push({
                    participantField,
                    topic: topic.topic,
                    participantId: participant.id,
                    status: 'ok',
                    message: 'По данной теме участник имеет товар ППК',
                    product: currentProductInTopicInParticipant,
                    potintialProduct: null,
                });
            } else {
                //у участника есть товар ППК но в топике почему то он отсутствует
                participantPpkThemesStats.push({
                    participantField,
                    topic: topic.topic,
                    participantId: participant.id,
                    status: 'missing_ppk_quantity',
                    message:
                        'По данной теме участник не имеет товара ППК. Данный товар есть в спике Товаров, но в недостаточном количестве',
                    product: null,
                    potintialProduct: topic.products[0] ?? null,
                });
            }
        } else {
            // у участника не ни одного продукта
            participantPpkThemesStats.push({
                participantField,
                topic: topic.topic,
                participantId: participant.id,
                status: 'missing_ppk_quantity',
                message:
                    'По данной теме участник не имеет товара ППК. Данный товар есть в спике Товаров, но в недостаточном количестве',
                product: null,
                potintialProduct: topic.products[0] ?? null,
            });
            console.log(
                'у участника не ни одного продукта',
                participant.id,
                topic.topic,
            );
            console.log(participantPpkThemesStats);
        }
    });

    return participantPpkThemesStats;
};
// type TopicMap = Record<string, IAlfaProduct[]>;

// function buildTopicToProductMap(products: IAlfaProduct[]): TopicMap {
//     const topicMap: TopicMap = {};

//     for (const product of products) {
//         const topicField = product.fields.find(f => f.bitrixId === bxProductData.SEMINAR_TOPIC.bitrixId);
//         const topic = (topicField?.value as { value: string })?.value;

//         if (!topic) continue;

//         if (!topicMap[topic]) {
//             topicMap[topic] = [];
//         }

//         topicMap[topic].push(product);
//     }

//     return topicMap;
// }

// type ParticipantMatch = {
//     participant: IParticipant;
//     topic: string;
// };

// function matchParticipantsToTopics(participants: IParticipant[]): ParticipantMatch[] {
//     const matches: ParticipantMatch[] = [];

//     for (const p of participants) {
//         for (const field of p.fields) {
//             if (!participantPpkFieldCodes.includes(field.code as BxParticipantsDataKeys)) continue;

//             const values = Array.isArray(field.value) ? field.value : [field.value];

//             for (const topic of values) {
//                 if (topic) {
//                     matches.push({ participant: p, topic });
//                 }
//             }
//         }
//     }

//     return matches;
// }

// type TopicStats = {
//     topic: string;
//     participants: IParticipant[];
//     products: IAlfaProduct[];
//     quantityTotal: number; // общее количество по всем продуктам
//     quantityNeeded: number; // участников
//     quantityDiff: number;   // разница (можно - нужно)
// };

// function buildTopicStats(
//     topicMap: TopicMap,
//     matches: ParticipantMatch[]
// ): TopicStats[] {
//     const topicToParticipants: Record<string, IParticipant[]> = {};

//     for (const match of matches) {
//         if (!topicToParticipants[match.topic]) {
//             topicToParticipants[match.topic] = [];
//         }

//         topicToParticipants[match.topic]?.push(match.participant);
//     }

//     const allTopics = new Set([...Object.keys(topicMap), ...Object.keys(topicToParticipants)]);

//     return Array.from(allTopics).map(topic => {
//         const products = topicMap[topic] || [];
//         const participants = topicToParticipants[topic] || [];

//         const quantityTotal = products.reduce((sum, p) => sum + (p.quantity ?? 0), 0);
//         const quantityNeeded = participants.length;
//         const quantityDiff = quantityTotal - quantityNeeded;

//         return {
//             topic,
//             products,
//             participants,
//             quantityTotal,
//             quantityNeeded,
//             quantityDiff
//         };
//     });
// }
