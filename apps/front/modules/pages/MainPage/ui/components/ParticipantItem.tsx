'use client';
import { SimpleCard } from '@/modules/shared';
import { ParticipantsTableWidget } from '@/modules/widgetes/Participant/ParticipantsTable/ParticipantsTableWidget';


export const ParticipantItem = () => {

    return (
        <SimpleCard
            title="Участники"
            children={
                <ParticipantsTableWidget />

            }
        />
    );
};
