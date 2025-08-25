'use client';
import { useParticipantInfo } from '../../../hook/useParticipantInfo';
import { TopicsBadgeList } from './components/TopicsBadgeList';

export const ParticipantProductInfo = ({
    participantId,
}: {
    participantId: number;
}) => {
    const { assignedProducts, assignedSeminars, isParticipantPpkLoading } =
        useParticipantInfo(participantId);
    return (
        <TopicsBadgeList
            title="Назначенные товары"
            participantId={participantId}
            themes={[...assignedProducts, ...assignedSeminars].map(
                (product, index) =>
                    product.product?.name || `Продукт ${index + 1}`,
            )}
            type="product"
            isLoading={isParticipantPpkLoading}
        />
    );
};
