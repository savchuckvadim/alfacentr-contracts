import { TableCell } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { Tooltip } from '@/modules/shared';

interface ProgramsCellProps {
    programs: string;
    participantPpkTopicsStats: any[];
}

export const ProgramsCell = ({
    programs,
    participantPpkTopicsStats,
}: ProgramsCellProps) => {
    const programsCount = participantPpkTopicsStats.length;

    const programsTooltip = (
        <div className="flex flex-col gap-2 w-[500px] max-w-120">
            {participantPpkTopicsStats.map((topic, index) => (
                <div
                    key={`${topic.participantId}-${index}`}
                    className="text-sm"
                >
                    {topic.topic}
                </div>
            ))}
        </div>
    );

    if (programs === 'Не выбрано') {
        return (
            <TableCell>
                <span className="text-muted-foreground text-sm">
                    Не выбрано
                </span>
            </TableCell>
        );
    }

    return (
        <TableCell>
            <div className="max-w-md">
                <Tooltip content={programsTooltip}>
                    <Badge
                        variant="secondary"
                        className="text-xs cursor-help w-20"
                    >
                        {programsCount}
                    </Badge>
                </Tooltip>
            </div>
        </TableCell>
    );
};
