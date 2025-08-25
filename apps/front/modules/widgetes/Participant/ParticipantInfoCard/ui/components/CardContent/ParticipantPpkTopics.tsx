'use client';
import { useParticipantInfo } from '../../../hook/useParticipantInfo';
import { TopicsBadgeList } from './components/TopicsBadgeList';

export const ParticipantPpkTopics = ({
    participantId,
}: {
    participantId: number;
}) => {
    const {
        isParticipantPpkLoading,

        programsThemes,
    } = useParticipantInfo(participantId);

    return (
        <TopicsBadgeList
            title="Темы ППК"
            participantId={participantId}
            themes={programsThemes}
            type="ppk"
            isLoading={isParticipantPpkLoading}
        />
    );
};
