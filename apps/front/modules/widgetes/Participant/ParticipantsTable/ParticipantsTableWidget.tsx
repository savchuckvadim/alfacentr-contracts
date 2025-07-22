import { ParticipantsTable } from './ParticipantsTable';
import { Badge } from '@workspace/ui/components/badge';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useParticipantsInfo } from '../ParticipantInfoCard/hook/useParticipantsInfo';
import { LinkBadge, Tooltip } from '@/modules/shared';
import { ParticipantsProblems } from '../ParticipantReport/ParticipantsProblems';

export const ParticipantsTableWidget = () => {
    const { hasProblems, participantsProblems, problemsCount } =
        useParticipantsInfo();

    return (
        <div>
            <div className="flex flex-row justify-between items-center gap-2 py-2">
                <div className="flex flex-row gap-2 px-2">
                    <h3 className="text-lg font-bold">Участники</h3>
                </div>
                <div className="flex flex-row gap-2">
                    {hasProblems ? (
                        <Tooltip
                            content={
                                <div className="p-0 m-0 flex flex-col gap-2 w-[1000px] h-[400px] bg-background overflow-y-auto">
                                    <ParticipantsProblems />
                                </div>
                            }
                        >
                            <Badge
                                className="cursor-help"
                                variant={
                                    hasProblems ? 'destructive' : 'default'
                                }
                            >
                                {hasProblems
                                    ? 'Проблемы ' + problemsCount
                                    : '+'}
                            </Badge>
                        </Tooltip>
                    ) : (
                        <Badge variant={'secondary'}>ОК</Badge>
                    )}
                    <LinkBadge
                        href="/bitrix/participants"
                        text="К участникам"
                        name="Подробнее"
                    />
                </div>
            </div>
            <ParticipantsTable />
        </div>
    );
};
