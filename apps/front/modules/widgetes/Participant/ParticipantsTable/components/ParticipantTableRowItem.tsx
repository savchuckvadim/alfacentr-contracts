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

            <NameCell participant={participant} name={name} />

            <ContactCell value={email} type="email" />

            <ContactCell value={phone} type="phone" />

            <FormatCell format={format} />

            <ProgramsCell
                programs={programs}
                participantPpkTopicsStats={participantPpkTopicsStats}
            />
            <ProgramsCell
                programs={days}
                participantPpkTopicsStats={seminarsPpkTopicsStats}
            />

            <ProductsCell
                assignedProducts={assignedProducts}
                participantPpkTopicsStats={participantPpkTopicsStats}
            />

            <ProductsCell
                assignedProducts={assignedSeminars}
                participantPpkTopicsStats={seminarsPpkTopicsStats}
            />
            <PpkStatusCell isPpk={isPpk} />

            <ActionsCell
                participant={participant}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />
        </TableRow>
    );
}
