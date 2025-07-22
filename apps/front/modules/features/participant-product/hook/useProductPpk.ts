import {
    getIsPpkProduct,
    getIsSeminarProduct,
    getIsUpProduct,
    getProductTypeName,
} from '@/modules/entities/product/lib/get-product-type.util';
import { useParticipantPpk } from './useParticipantPpk';
import { IAlfaProduct } from '@/modules/entities';

export const useProductPpk = (product: IAlfaProduct) => {
    const productType = getProductTypeName(product);
    const isPpk = getIsPpkProduct(product);
    const isSeminar = getIsSeminarProduct(product);
    const isUp = getIsUpProduct(product);
    const {
        topicStats,

        productToParticipants,
    } = useParticipantPpk();

    // Получаем количество назначенных участников
    const assignedParticipants =
        productToParticipants[product.id?.toString() || ''] || [];
    const assignedCount = assignedParticipants.length;

    // Определяем цвет бейджа для типа продукта

    const getTypeBadgeColor = () => {
        if (isPpk) return 'bg-indigo-700 text-zinc-50' as const;
        if (isSeminar) return 'bg-foreground text-background' as const;
        if (isUp) return 'bg-orange-700 text-zinc-50' as const;
        return 'bg-secondary' as const;
    };

    // Определяем статус заполненности для ППК продуктов
    const getAvailabilityStatus = () => {
        if (!isPpk || !product) return null;

        // const { needed, available, diff } = productStats
        const diff = (product.quantity || 0) - assignedCount;

        if (diff < 0)
            return {
                status: 'deficit',
                message: `Слишком много участников: ${Math.abs(diff)} мест`,
                variant: 'destructive' as const,
            };
        if (diff > 0)
            return {
                status: 'surplus',
                message: `Слишком мало участников: ${diff} свободных мест`,
                variant: 'destructive' as const,
            };
        return {
            status: 'balanced',
            message: 'Мест достаточно',
            variant: 'default' as const,
        };
    };

    const availabilityStatus = getAvailabilityStatus();
    const productName =
        product.productName || product.product?.name || 'Не указано';
    const quantity = product.quantity || 0;
    const price = product.price || 0;
    const formattedQuantity = quantity.toString();
    const formattedPrice = price.toLocaleString('ru-RU', {
        style: 'currency',
        currency: 'RUB',
    });

    return {
        productType,
        isPpk,
        isSeminar,
        isUp,
        assignedCount,
        productName,
        quantity,
        formattedQuantity,
        price,
        formattedPrice,
        availabilityStatus,
        getTypeBadgeColor,
    };
};
