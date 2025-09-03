'use client';
import { useApp } from '@/modules/app';
import { ParticipantsPage } from '@/modules/entities/participant/ui';

export default function Participants() {
    const { isClient } = useApp();
    if (!isClient) {
        return null;
    }
    return (
        <div className="max-w-[1600px]  mx-auto px-4 py-6">
            <ParticipantsPage />
        </div>
    );
}
