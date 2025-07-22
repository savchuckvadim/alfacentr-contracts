import { TableCell } from '@workspace/ui/components/table';
import Link from 'next/link';
import { IParticipant } from '@alfa/entities';

interface NameCellProps {
    participant: IParticipant;
    name: string;
}

export const NameCell = ({ participant, name }: NameCellProps) => {
    return (
        <TableCell>
            <div>
                <Link href={`/bitrix/participants/${participant.id}`}>
                    <div className="cursor-pointer font-medium text-foreground hover:text-primary transition-colors">
                        {name || 'Не указано'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        ID: {participant.id}
                    </div>
                </Link>
            </div>
        </TableCell>
    );
};
