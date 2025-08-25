'use client';
import { useParticipantPpk } from '@/modules/features/participant-product';
import { IParticipant } from '@alfa/entities/';
import { ParticipantProducts } from './ParticipantProducts';

export const ParticipantPpkProducts = ({
    participantId,
    participant,
    loading,
}: {
    participantId: number;
    participant: IParticipant;
    loading: boolean;
}) => {
    const id = participantId;
    const { participantToProducts } = useParticipantPpk();
    const products = participantToProducts[id];

    if (!participant) {
        return null;
    }

    return (
        <ParticipantProducts
            isPpk={true}
            participantId={participantId}
            participant={participant}
            products={products}
            loading={loading}
        />
    );
};
