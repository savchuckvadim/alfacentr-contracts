import { Tooltip } from '@/modules/shared';
import { IParticipant } from '@alfa/entities';
import { Badge } from '@workspace/ui/components/badge';
import { FC } from 'react';
import { useParticipantInfo } from '../../../hook/useParticipantInfo';
import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';
import { cn } from '@workspace/ui/lib/utils';

export interface PartisipantCardStatusProps {
    participant: IParticipant;
}

export const PartisipantCardStatus: FC<PartisipantCardStatusProps> = ({
    participant,
}) => {
    const {
        hasProblems,
        problems,
        isParticipantPpkLoading,
        participantToProducts,
        participantToSeminars,
    } = useParticipantInfo(participant.id);
    if (isParticipantPpkLoading) {
        return <MicroPreloader />;
    }

    //товары участника живут в двух распределениях: программы ППК и семинары.
    //участник только с семинарами (без единой программы) — штатный случай,
    //ошибку показываем, лишь когда пусто в обоих
    const withoutPpkProduct =
        !participantToProducts[participant.id] ||
        participantToProducts[participant.id]?.length === 0;
    const withoutSeminar =
        !participantToSeminars[participant.id] ||
        participantToSeminars[participant.id]?.length === 0;
    const withoutProduct = withoutPpkProduct && withoutSeminar;

    if (hasProblems && problems.length > 0) {
        let isProblen = false;
        const messages = (
            <div className="flex flex-col gap-2">
                {problems.map((problem, index) => {
                    const color =
                        problem.status === 'missing_ppk'
                            ? 'text-red-500'
                            : 'text-yellow-500';
                    if (problem.status === 'missing_ppk') {
                        isProblen = true;
                    }
                    return (
                        <div
                            key={problem.participantId + index}
                            className="flex flex-col gap-5"
                        >
                            <p className="text-sm font-medium">
                                {problem.topic}{' '}
                                <span className={cn(color, 'text-sm')}>
                                    {problem.message}
                                </span>
                            </p>
                        </div>
                    );
                })}
            </div>
        );
        return (
            <div className="flex items-center gap-1">
                <Tooltip
                    content={<p className="text-sm w-[700px]">{messages}</p>}
                >
                    <Badge
                        variant={isProblen ? 'destructive' : 'secondary'}
                        className={cn(
                            isProblen ? 'bg-red-500' : 'bg-yellow-300',
                            'text-xs',
                        )}
                    >
                        Проблема
                    </Badge>
                </Tooltip>
            </div>
        );
    }

    if (withoutProduct) {
        const messages = (
            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                    Участник не имеет продуктов
                </p>
            </div>
        );
        return (
            <div className="flex items-center gap-1 cursor-help">
                <Tooltip
                    content={<p className="text-sm w-[300px]">{messages}</p>}
                >
                    <Badge variant="destructive" className="text-xs">
                        Проблема
                    </Badge>
                </Tooltip>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1">
            <Badge
                variant="secondary"
                className="bg-teal-300 text-green-800 text-xs"
            >
                ОK
            </Badge>
        </div>
    );
};
