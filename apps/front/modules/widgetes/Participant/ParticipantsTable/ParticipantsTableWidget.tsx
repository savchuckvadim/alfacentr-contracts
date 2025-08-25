import { ParticipantsTable } from './ParticipantsTable';

import { LinkBadge } from '@/modules/shared';
import { ParticipantsProblemsPpkBadge } from './components/badges/ParticipantsProblemsPpkBadge';
import { ParticipantsProblemsSeminarBadge } from './components/badges/ParticipantsProblemsSeminarBadge';
import {
    withPpkContractTypeSelector,
    withSeminarContractTypeSelector,
} from '@/modules/features/contract-type';
import { useAppSelector } from '@/modules/app';

export const ParticipantsTableWidget = () => {
    const withSeminarType = useAppSelector(withSeminarContractTypeSelector);
    const withPpkType = useAppSelector(withPpkContractTypeSelector);

    return (
        <div>
            <div className="flex flex-row justify-between items-center gap-2 py-2">
                <div className="flex flex-row gap-2 px-2">
                    <h3 className="text-lg font-bold">Участники</h3>
                </div>
                <div className="flex flex-row gap-2">
                    <ParticipantsProblemsPpkBadge />
                    <ParticipantsProblemsSeminarBadge />
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
