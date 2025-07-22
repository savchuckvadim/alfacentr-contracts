import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';
import { useParticipantPpk } from '@/modules/features';

export const ProductParticipantCount = ({
    productId,
}: {
    productId: number;
}) => {
    const { productToParticipants } = useParticipantPpk();
    const {} = useAlfaProducts();
    const participantsCount = productToParticipants[productId]?.length || 0;
    return (
        <div>
            <span className="text-sm text-gray-500">{participantsCount}</span>
        </div>
    );
};
