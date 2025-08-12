'use client';
import { IAlfaProduct } from '@/modules/entities/product/model/ProductSlice';
import { Tooltip } from '@/modules/shared';
import { FC } from 'react';
import { useProductPpk } from '../../../hook/useProductPpk';
import { Badge } from '@workspace/ui/components/badge';
import { useProductSeminar } from '../../../hook/useProductSeminar';
import { useApp } from '@/modules/app';

export const ProductParticipantQuantityBadge: FC<{
    product: IAlfaProduct;
}> = ({ product }) => {
    const {
        productType,
        isPpk,
        assignedCount,
        participantsNamesString,
        quantity,
    } = useProductPpk(product);

    const {
        isSeminar,
        assignedCount: assignedCountSeminar,
        quantity: quantitySeminar,
        participantsNamesString: participantsNamesStringSeminar,
    } = useProductSeminar(product);
    const { isClient } = useApp();
    if (!isClient) return null;

    return (
        <>
            {isPpk && (
                <Tooltip content={participantsNamesString}>
                    <Badge
                        variant={
                            assignedCount > quantity ? 'destructive' : 'default'
                        }
                        className="text-xs"
                    >
                        {assignedCount}
                    </Badge>
                </Tooltip>
            )}

            {isSeminar && (
                <Tooltip content={participantsNamesStringSeminar}>
                    <Badge
                        variant={
                            assignedCountSeminar > quantitySeminar
                                ? 'destructive'
                                : 'default'
                        }
                        className="text-xs"
                    >
                        {assignedCountSeminar}
                    </Badge>
                </Tooltip>
            )}
        </>
    );
};
