'use client';
import { SimpleStatisticsCards, SimpleStatisticsProps } from '@/modules/shared';

import { useParticipantsInfo } from '../ParticipantInfoCard/hook/useParticipantsInfo';
import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';

export const PartisipantProductSimpleStatistics = () => {
    const {
        isParticipantPpkLoading,
        participantsCount,
        withPpkCount,
        withoutPpkCount,
        paricipantWithProblemCount,
    } = useParticipantsInfo();
    const cards = [
        {
            title: 'Всего участников',
            value: participantsCount,
            color: 'blue',
        },
        {
            title: 'С ППК',
            value: withPpkCount,
            color: 'green',
        },
        {
            title: 'Без ППК',
            value: withoutPpkCount,
            color: 'orange',
        },
        {
            title: 'Требуют внимания',
            value: paricipantWithProblemCount,
            color: 'red',
        },
    ] as SimpleStatisticsProps[];

    return isParticipantPpkLoading ? (
        <MicroPreloader />
    ) : (
        <SimpleStatisticsCards cards={cards} />
    );
};
