import { IAlfaProduct } from '@/modules/entities';
import { Tooltip } from '@/modules/shared';
import { useProductPpk, useProductSeminar } from '../../..';
import { Badge } from '@workspace/ui/components/badge';
import { useApp } from '@/modules/app';

export const ProductParticipantStatusBadge = ({
    product,
    index,
}: {
    product: IAlfaProduct;
    index: number;
}) => {
    const { isClient } = useApp();
    const {
        productType,
        isPpk,

        isUp,
        assignedCount,
        productName,
        quantity: quantityPpk,
        formattedQuantity,
        price,
        formattedPrice,
        availabilityStatus: availabilityStatusPpk,
        getTypeBadgeColor,
    } = useProductPpk(product);

    const {
        isSeminar,
        assignedCount: assignedCountSeminar,
        quantity: quantitySeminar,
        participantsNamesString: participantsNamesStringSeminar,
        availabilityStatus: availabilityStatusSeminar,
    } = useProductSeminar(product);

    const availabilityStatus = isPpk
        ? availabilityStatusPpk
        : availabilityStatusSeminar;
    const quantity = isPpk ? quantityPpk : quantitySeminar;

    if (!isClient) return null;
    if (!isPpk && !isSeminar) return null;

    return (
        <Tooltip content={availabilityStatus?.message || ''}>
            <Badge
                variant={'default'}
                className={`m-0 p-0 text-xs w-18 h-5 ${
                    (isPpk || isSeminar) &&
                    availabilityStatus?.status === 'balanced'
                        ? 'bg-indigo-700 text-zinc-50'
                        : (isPpk || isSeminar) &&
                            availabilityStatus?.status !== 'balanced'
                          ? 'bg-red-500 text-zinc-50'
                          : quantity > 0
                            ? 'bg-green-500 text-zinc-50'
                            : 'bg-red-500 text-zinc-50'
                }`}
            >
                {(isPpk || isSeminar) &&
                availabilityStatus?.status === 'balanced'
                    ? 'ок'
                    : (isPpk || isSeminar) &&
                        availabilityStatus?.status !== 'balanced'
                      ? 'проблема'
                      : quantity > 0
                        ? 'ок'
                        : 'проблема'}
            </Badge>
        </Tooltip>
    );
};
