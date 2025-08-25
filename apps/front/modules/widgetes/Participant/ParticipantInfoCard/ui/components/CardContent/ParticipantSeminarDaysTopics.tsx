import { ComponentPreloader } from '@/modules/shared/Preloader/ComponentPreloader';
import { useParticipantInfo } from '../../../hook/useParticipantInfo';
import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';
import { BookOpen, Eye, EyeClosed } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Tooltip } from '@/modules/shared';
import { cutString } from '@/modules/lib';
import { IParticipant } from '@alfa/entities';
import { getParticipantDaysArray } from '@/modules/entities';
import { useState } from 'react';
import { useEffect } from 'react';
import { TopicsBadgeList } from './components/TopicsBadgeList';

export const ParticipantSeminarDaysTopics = ({
    participant,
}: {
    participant: IParticipant;
}) => {
    const { isParticipantPpkLoading } = useParticipantInfo(participant.id);
    const days = getParticipantDaysArray(participant);
    return (
        <TopicsBadgeList
            title="Дни участия"
            participantId={participant.id}
            themes={days}
            type="seminar"
            isLoading={isParticipantPpkLoading}
        />
    );
};
