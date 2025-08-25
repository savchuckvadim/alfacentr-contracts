import { Tooltip } from '@/modules/shared';
import { useParticipantsInfo } from '../../../ParticipantInfoCard/hook/useParticipantsInfo';
import { ParticipantsProblems } from '@/modules/widgetes';
import { Badge } from '@workspace/ui/components/badge';
import { useAppSelector } from '@/modules/app';

export const ParticipantsProblemsPpkBadge = () => {
    const { hasProblems, problemsCount } = useParticipantsInfo();

    return (
        <>
            {hasProblems ? (
                <Tooltip
                    content={
                        // <div className="p-0 m-0 flex flex-col gap-2 w-[1000px] h-[400px] bg-background overflow-y-auto">
                        <ParticipantsProblems />
                        // </div>
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
