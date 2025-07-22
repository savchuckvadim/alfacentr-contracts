import { TableCell } from '@workspace/ui/components/table';

interface IndexCellProps {
    index: number;
}

export const IndexCell = ({ index }: IndexCellProps) => {
    return (
        <TableCell className="font-medium text-primary">{index + 1}</TableCell>
    );
};
