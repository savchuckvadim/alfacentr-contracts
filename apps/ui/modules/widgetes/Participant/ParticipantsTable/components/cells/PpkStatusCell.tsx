import { TableCell } from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"

interface PpkStatusCellProps {
    isPpk: boolean
}

export const PpkStatusCell = ({ isPpk }: PpkStatusCellProps) => {
    return (
        <TableCell>
            {isPpk ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                    Да
                </Badge>
            ) : (
                <Badge variant="outline" className="text-foreground">
                    Нет
                </Badge>
            )}
        </TableCell>
    )
} 