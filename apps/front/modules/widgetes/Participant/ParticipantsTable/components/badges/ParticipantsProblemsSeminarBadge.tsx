import { Tooltip } from '@/modules/shared';
import { Badge } from '@workspace/ui/components/badge';
import { useParticipantsSeminarInfo } from '../../../ParticipantInfoCard/hook/useParticipantsSeminarInfo';
import { ParticipantsSeminarProblems } from '../../../ParticipantReport/ParticipantsSeminarProblems';

export const ParticipantsProblemsSeminarBadge = () => {
    const { hasProblems, problemsCount } = useParticipantsSeminarInfo();

    return (
        <>
            {hasProblems ? (
                <Tooltip
                    content={
                        <div className="p-0 m-0 flex flex-col gap-2 w-[1000px] h-[400px] bg-background overflow-y-auto">
                            <ParticipantsSeminarProblems />
                        </div>
                    }
                >
                    <Badge
                        className="cursor-help"
                        variant={hasProblems ? 'destructive' : 'default'}
                    >
                        {hasProblems ? 'Проблемы ' + problemsCount : '+'}
                    </Badge>
                </Tooltip>
            ) : (
                <Badge variant={'secondary'}>ОК</Badge>
            )}
        </>
    );
};
