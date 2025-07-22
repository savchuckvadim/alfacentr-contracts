import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';
import { useParticipantPpk } from '@/modules/features/participant-product/hook/useParticipantPpk';

export const useProductStatistics = () => {
    const { items, ppkProducts, seminarProducts, upProducts } =
        useAlfaProducts();

    const { topicStats, participantToProducts, unassignedParticipants } =
        useParticipantPpk();

    // Общая статистика
    const totalProducts = items.length;
    const totalPpkProducts = ppkProducts.length;
    const totalSeminarProducts = seminarProducts.length;
    const totalUpProducts = upProducts.length;

    // Статистика по участникам
    const totalUnassignedParticipants = unassignedParticipants.length;
    const totalAssignedParticipants = Object.keys(participantToProducts).length;

    // Статистика по темам ППК
    const totalTopics = topicStats.length;
    const topicsWithDeficit = topicStats.filter(stat => stat.diff < 0).length;
    const topicsWithSurplus = topicStats.filter(stat => stat.diff > 0).length;
    const balancedTopics = topicStats.filter(stat => stat.diff === 0).length;

    // Финансовая статистика
    const totalSum = items.reduce(
        (sum, product) => sum + (product.price || 0) * (product.quantity || 0),
        0,
    );
    const ppkSum = ppkProducts.reduce(
        (sum, product) => sum + (product.price || 0) * (product.quantity || 0),
        0,
    );
    const seminarSum = seminarProducts.reduce(
        (sum, product) => sum + (product.price || 0) * (product.quantity || 0),
        0,
    );
    const upSum = upProducts.reduce(
        (sum, product) => sum + (product.price || 0) * (product.quantity || 0),
        0,
    );

    return {
        totalProducts,
        totalPpkProducts,
        totalSeminarProducts,
        totalUpProducts,
        totalAssignedParticipants,
        totalUnassignedParticipants,
        totalTopics,
        topicsWithDeficit,
        topicsWithSurplus,
        balancedTopics,
        totalSum,
        seminarSum,
        upSum,
        ppkSum,
    };
};
