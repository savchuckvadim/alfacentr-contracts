import { IAlfaProduct } from '@/modules/entities';
import {
    BxParticipantsDataKeys,
    bxProductData,
    IParticipant,
} from '@alfa/entities';
import { getProductsByType } from '../utils/product.util';
import {
    IParticipantPpkMap,
    IParticipantPpkTopicsStats,
    ITopicStat,
    ParticipantPpkFieldCodes,
} from '../../type/participant-ppk.type';
import { getParicipantPpkTopicsStats } from '../utils/participant-products';

type Topic = string;

export class PpkDistributorService {
    private participants: IParticipant[];
    private products: IAlfaProduct[];
    private topicProductMap: Map<Topic, IAlfaProduct[]>;
    private topicParticipantMap: Map<Topic, IParticipant[]>;
    private unassignedParticipants: IParticipant[];

    constructor(participants: IParticipant[], products: IAlfaProduct[]) {
        this.participants = participants;
        this.products = getProductsByType(products, 'ppk') || [];
        this.topicProductMap = this.buildTopicToProductMap();
        this.topicParticipantMap = this.buildTopicToParticipantMap();
        this.unassignedParticipants = [];
    }

    public distribute(): IParticipantPpkMap {
        const participantToProducts = new Map<number, IAlfaProduct[]>();
        const productToParticipants = new Map<number, IParticipant[]>();
        const topicStats: ITopicStat[] = [];

        for (const [
            topic,
            participants,
        ] of this.topicParticipantMap.entries()) {
            const products = this.topicProductMap.get(topic) || [];
            const expandedProducts = this.expandProductsByQuantity(products); // продукт с quantity 2 → [prod, prod]

            const available = expandedProducts.length;
            const needed = participants.length;
            const diff = available - needed;

            topicStats.push({
                topic,
                needed,
                available,
                diff,
                participants,
                products,
            });

            // Распределяем участников по продуктам (рандомно)
            const shuffledParticipants = participants; // this.shuffle([...participants]);

            // for (let i = 0; i < Math.min(available, shuffledParticipants.length); i++) {
            //     const participant = shuffledParticipants[i];
            //     const product = expandedProducts[i];
            //     if (!participant || !product) continue;

            //     // Привязываем участника к продукту
            //     if (!participantToProducts.has(participant.id)) {
            //         participantToProducts.set(participant.id, []);
            //     }
            //     participantToProducts.get(participant.id)!.push(product);
            //     const productId = product.id as number;
            //     if (!productToParticipants.has(productId)) {
            //         productToParticipants.set(productId, []);
            //     }
            //     productToParticipants.get(productId)!.push(participant);
            // }

            for (let i = 0; i < shuffledParticipants.length; i++) {
                const participant = shuffledParticipants[i];
                const product = expandedProducts[i]; // может быть undefined
                if (!participant) continue;
                if (product) {
                    // Привязываем участника к продукту
                    if (!participantToProducts.has(participant.id)) {
                        participantToProducts.set(participant.id, []);
                    }
                    participantToProducts.get(participant.id)!.push(product);

                    const productId = product.id as number;
                    if (!productToParticipants.has(productId)) {
                        productToParticipants.set(productId, []);
                    }
                    productToParticipants.get(productId)!.push(participant);
                } else {
                    // Нет свободного продукта — сохраняем участника
                    if (
                        !this.unassignedParticipants.some(
                            p => p.id === participant.id,
                        )
                    ) {
                        this.unassignedParticipants.push(participant);
                    }
                }
            }
        }
        const participantsPpkTopicsStats: IParticipantPpkTopicsStats = {};
        this.participants.forEach(participant => {
            const participantPpkTopicsStats = getParicipantPpkTopicsStats(
                participant,
                topicStats,
                participantToProducts,
            );
            if (
                participantPpkTopicsStats &&
                participantPpkTopicsStats.length > 0
            ) {
                participantsPpkTopicsStats[participant.id] =
                    participantPpkTopicsStats;
            }
        });

        return {
            participantsPpkTopicsStats,
            participantToProducts,
            productToParticipants,
            topicStats,
            unassignedParticipants: this.unassignedParticipants,
        };
    }

    private buildTopicToProductMap(): Map<Topic, IAlfaProduct[]> {
        const map = new Map<Topic, IAlfaProduct[]>();

        for (const product of this.products) {
            const topic = this.getProductTopic(product);
            if (!topic) continue;

            if (!map.has(topic)) map.set(topic, []);
            map.get(topic)!.push(product);
        }

        return map;
    }

    private buildTopicToParticipantMap(): Map<Topic, IParticipant[]> {
        const map = new Map<Topic, IParticipant[]>();

        for (const participant of this.participants) {
            const topics = this.getParticipantTopics(participant);
            for (const topic of topics) {
                if (!map.has(topic)) map.set(topic, []);
                map.get(topic)!.push(participant);
            }
        }

        return map;
    }

    private getProductTopic(product: IAlfaProduct): string | null {
        const field = product.fields.find(
            f => f.bitrixId === bxProductData.NAME_BID.bitrixId,
        );
        return (field?.value as { value: string })?.value || null;
    }

    private getParticipantTopics(participant: IParticipant): string[] {
        const result: string[] = [];

        for (const field of participant.fields) {
            if (
                !ParticipantPpkFieldCodes.includes(
                    field.code as BxParticipantsDataKeys,
                )
            )
                continue;

            const values = Array.isArray(field.value)
                ? field.value
                : [field.value];
            for (const v of values) {
                if (v) result.push(v);
            }
        }

        return result;
    }

    private expandProductsByQuantity(products: IAlfaProduct[]): IAlfaProduct[] {
        const result: IAlfaProduct[] = [];

        for (const product of products) {
            const quantity = product.quantity || 1;
            for (let i = 0; i < quantity; i++) {
                result.push(product); // одна и та же ссылка, но логика соблюдается
            }
        }

        return result;
    }

    private shuffle<T>(array: T[]): T[] {
        const result = [...array]; // копия, не мутируем оригинал

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            // Явно утверждаем, что элементы по индексам существуют
            const temp = result[i]!;
            result[i] = result[j]!;
            result[j] = temp;
        }

        return result;
    }
    // private shuffle<T>(array: T[]): T[] {
    //     const result = [...array]; // копия, не мутируем оригинал

    //     for (let i = result.length - 1; i > 0; i--) {
    //         const j = Math.floor(Math.random() * (i + 1));

    //         // Явно утверждаем, что элементы по индексам существуют
    //         const temp = result[i]!;
    //         result[i] = result[j]!;
    //         result[j] = temp;
    //     }

    //     return result;
    // }
}
