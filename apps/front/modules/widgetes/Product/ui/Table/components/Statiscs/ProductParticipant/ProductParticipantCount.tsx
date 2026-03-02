import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';
import { useParticipantPpk } from '@/modules/features';
import { memo, useMemo } from 'react';

export const ProductParticipantCount = ({
    productId,
}: {
    productId: number;
}) => {
    const { productToParticipants } = useParticipantPpk();
    const {} = useAlfaProducts();
    const participantsCount = useMemo(
        () => productToParticipants[productId]?.length || 0,
        [productToParticipants, productId],
    );

    return memo(() => (
        <div>
            <span className="text-sm text-gray-500">{participantsCount}</span>
        </div>
    ));
};
