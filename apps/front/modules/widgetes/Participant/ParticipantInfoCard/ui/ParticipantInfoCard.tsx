import { cn } from '@workspace/ui/lib/utils';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { ExternalLink } from 'lucide-react';

import { IParticipant } from '@alfa/entities';

import { ComponentPreloader, Tooltip } from '@/modules/shared';
import Link from 'next/link';
import { useParticipantInfo } from '../hook/useParticipantInfo';

import { ParticipantCardHeader } from './components/CardHeader/ParticipantCardHeader';
import { ParticipantContactInfo } from './components/CardContent/ParticipantContactInfo';
import { ParticipantProductInfo } from './components/CardContent/ParticipantProductInfo';
import { ParticipantPpkTopics } from './components/CardContent/ParticipantPpkTopics';
import { ParticipantSeminarDaysTopics } from './components/CardContent/ParticipantSeminarDaysTopics';

export const ParticipantInfoCard = ({
    participant,
}: {
    participant: IParticipant;
}) => {
    // const { getParticipantPpkTopicsStats, isLoading, getParticipantProblems } = useParticipantPpk()
    // const { hasProblems, participantPpkTopicsStats } = getParticipantProblems(participant.id)
    // const { participantToProducts } = useParticipantPpk()
    const {
        isPartisipantsLoading,
        // isParticipantPpkLoading,
        hasProblems,
        // problems,
        // participantPpkTopicsStats,
        // participantToProducts,
        // programsThemes,
        // assignedProducts,
        // isPpk,
    } = useParticipantInfo(participant.id);

    if (isPartisipantsLoading) {
        return <ComponentPreloader text="Загрузка данных участника..." />;
    }
    // const programsThemes = participantPpkTopicsStats.map(stat => stat.topic)
    // const assignedProducts = participantToProducts[participant.id] ?? []

    return (
        <Card
            key={participant.id}
            className={cn(
                'hover:shadow-md transition-shadow cursor-pointer flex flex-col',
                hasProblems && 'border-destructive/50 bg-destructive/5',
            )}
        >
            <ParticipantCardHeader
                participant={participant}
                hasProblems={hasProblems}
            />

            <CardContent className="space-y-3 flex-1 flex flex-col">
                {/* Контактная информация */}
                <ParticipantContactInfo participant={participant} />

                {/* Назначенные продукты */}

                <ParticipantProductInfo participantId={participant.id} />
                <ParticipantSeminarDaysTopics participant={participant} />
                <ParticipantPpkTopics participantId={participant.id} />

                {/* Кнопка подробностей */}
                <div className="pt-2 mt-auto ">
                    <Link href={`/bitrix/participants/${participant.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Подробности
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};
