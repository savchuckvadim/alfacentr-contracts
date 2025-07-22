'use client';
import { useParticipantPpk } from '@/modules/features/participant-product/hook/useParticipantPpk';
import { Info } from '@/modules/shared';

export const ParticipantsProblems = ({
    participantId,
}: {
    participantId?: number;
}) => {
    const { unassignedParticipants, getParticipantsProblems, isLoading } =
        useParticipantPpk();

    let topicsInfo: React.ReactNode[] = [];
    const participants = participantId
        ? unassignedParticipants.filter(p => p.id === participantId)
        : unassignedParticipants;
    participants &&
        getParticipantsProblems(participants).participantsProblems.forEach(
            stat => {
                for (const key in stat) {
                    const typeKey = Number(key) as number;
                    if (
                        stat[typeKey]?.problems &&
                        stat[typeKey]?.problems.length > 0
                    ) {
                        const participantProblem = (
                            <div>
                                <p className="text-md font-bold text-red-500 mt-4">
                                    {stat[typeKey]?.name}
                                </p>
                                {stat[typeKey]?.problems.map((p, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className="space-y-2 mt-4 "
                                        >
                                            <ul className="list-disc list-inside space-y-1 text-sm">
                                                <li className="text-sm ">
                                                    {' '}
                                                    <span className="font-bold text-red-500">
                                                        Тема:
                                                    </span>{' '}
                                                    {p.topic}
                                                </li>
                                                <p className="text-sm font-bold">
                                                    <span className="font-bold text-red-500">
                                                        Сообщение:
                                                    </span>{' '}
                                                    {p.message}
                                                </p>
                                                <p className="text-sm font-bold">
                                                    <span className="font-bold text-red-500">
                                                        Решение:
                                                    </span>{' '}
                                                    {p.potintialProduct
                                                        ? `Увеличить количество ${p.potintialProduct?.productName}`
                                                        : 'Добавьте отсутствующий товар'}
                                                </p>
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                        topicsInfo.push(participantProblem);
                    }
                }
            },
        );

    return topicsInfo.length > 0 ? (
        <Info
            title="Проблемы участников"
            collapsible
            // description={`${ totalUnassignedParticipants } участников не назначены на ППК программы`}
            children={topicsInfo}
            type="error"
        />
    ) : null;
};
