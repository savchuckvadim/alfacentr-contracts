'use client';
import { useParticipantSeminar } from '@/modules/features/participant-product';
import { IParticipant } from '@alfa/entities/';
import { ParticipantProducts } from './ParticipantProducts';

export const ParticipantSeminarProducts = ({
    participantId,
    participant,
    loading,
}: {
    participantId: number;
    participant: IParticipant;
    loading: boolean;
}) => {
    const id = participantId;
    const { participantToProducts } = useParticipantSeminar();
    const products = participantToProducts[id];

    if (!participant) {
        return null;
    }

    return (
        <ParticipantProducts
            isPpk={false}
            participantId={participantId}
            participant={participant}
            products={products}
            loading={loading}
        />
    );
};
