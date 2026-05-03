'use client';

import { ParticipantsPage } from '@/modules/pages';

import type { ReactElement } from 'react';

export default function Participants(): ReactElement  {
    return (
        <div className="container mx-auto px-4 py-6">
            <ParticipantsPage />
        </div>
    );
}
