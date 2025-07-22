import { TableCell } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';

interface FormatCellProps {
    format: string;
}

export const FormatCell = ({ format }: FormatCellProps) => {
    if (!format) {
        return (
            <TableCell>
                <span className="text-muted-foreground text-sm">Не указан</span>
            </TableCell>
        );
    }

    const getFormatVariant = (format: string) => {
        switch (format) {
            case 'Онлайн':
                return 'secondary';
            case 'Очно':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getFormatStyles = (format: string) => {
        switch (format) {
            case 'Онлайн':
                return 'bg-sky-100 text-sky-800';
            case 'Очно':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-orange-100 text-orange-800';
        }
    };

    return (
        <TableCell>
            <Badge
                variant={getFormatVariant(format)}
                className={`text-xs ${getFormatStyles(format)}`}
            >
                {format}
            </Badge>
        </TableCell>
    );
};
