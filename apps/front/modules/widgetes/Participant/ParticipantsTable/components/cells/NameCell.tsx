import { TableCell } from '@workspace/ui/components/table';
import Link from 'next/link';
import { IParticipant } from '@alfa/entities';
import { Mail, Phone } from 'lucide-react';
interface NameCellProps {
    participant: IParticipant;
    name: string;
    phone: string;
    email: string;
}

export const NameCell = ({
    participant,
    name,
    phone,
    email,
}: NameCellProps) => {
    return (
        <TableCell>
            <div>
                <Link href={`/bitrix/participants/${participant.id}`}>
                    <div className="cursor-pointer font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
                        {name || 'Не указано'}
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-row gap-5 min-w-max">
                        <div className="flex items-center gap-2 ">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{phone}</span>
                        </div>
                        <div className="flex items-center gap-2 ">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{email}</span>
                        </div>
                    </div>
                </Link>
            </div>
        </TableCell>
    );
};
