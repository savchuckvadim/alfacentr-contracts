import { TableRow } from '@workspace/ui/components/table';
import { IParticipant } from '@alfa/entities';
import { useEditParticipant } from '../../ParticipantEdit/hook/useParticipantEdit';
import { useParticipantRowData } from '../hooks/useParticipantRowData';
import {
    IndexCell,
    NameCell,
    ContactCell,
    FormatCell,
    ProgramsCell,
    ProductsCell,
    PpkStatusCell,
    ActionsCell,
} from './cells';
import {
    withPpkContractTypeSelector,
    withSeminarContractTypeSelector,
} from '@/modules/features/contract-type';
import { useAppSelector } from '@/modules/app';

interface ParticipantTableRowItemProps {
    participant: IParticipant;
    index: number;
    handleDeleteClick: (participant: IParticipant) => void;
}

export function ParticipantTableRowItem({
    participant,
    index,
    handleDeleteClick,
}: ParticipantTableRowItemProps) {
    const withSeminarType = useAppSelector(withSeminarContractTypeSelector);
    const withPpkType = useAppSelector(withPpkContractTypeSelector);

    const { activateEditable } = useEditParticipant(participant.id);
    const {
        name,
        email,
        phone,
        format,
        isPpk,
        programs,
        days,
        participantPpkTopicsStats,
        seminarsPpkTopicsStats,
        assignedProducts,
        assignedSeminars,
    } = useParticipantRowData(participant.id);

    const handleEdit = (participantId: number) => {
        activateEditable(participantId);
    };

    return (
        <TableRow key={participant.id}>
            <IndexCell index={index} />

            <NameCell
                participant={participant}
                name={name}
                phone={phone}
                email={email}
            />

            {/* <ContactCell value={email} type="email" />

            <ContactCell value={phone} type="phone" /> */}

            <FormatCell format={format} />

            {withSeminarType && (
                <ProgramsCell
                    programs={days}
                    participantPpkTopicsStats={seminarsPpkTopicsStats}
                />
            )}

            {withSeminarType && (
                <ProductsCell
                    assignedProducts={assignedSeminars}
                    participantPpkTopicsStats={seminarsPpkTopicsStats}
                />
            )}
            <PpkStatusCell isPpk={isPpk} />
            {withPpkType && (
                <ProgramsCell
                    programs={programs}
                    participantPpkTopicsStats={participantPpkTopicsStats}
                />
            )}
            {withPpkType && (
                <ProductsCell
                    assignedProducts={assignedProducts}
                    participantPpkTopicsStats={participantPpkTopicsStats}
                />
            )}
            <ActionsCell
                participant={participant}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />
        </TableRow>
    );
}
