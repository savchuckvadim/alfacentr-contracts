import { TableCell } from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { Tooltip } from "@/modules/shared"
import Link from "next/link"
import { Eye, Edit, Trash2 } from "lucide-react"
import { IParticipant } from "@alfa/entities"

interface ActionsCellProps {
    participant: IParticipant
    onEdit: (participantId: number) => void
    onDelete: (participant: IParticipant) => void
}

export const ActionsCell = ({ participant, onEdit, onDelete }: ActionsCellProps) => {
    return (
        <TableCell>
            <div className="flex items-center gap-1">
                {/* Просмотр */}
                <Link href={`/bitrix/participants/${participant.id}`}>
                    <Tooltip content="Подробнее">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                </Link>

                {/* Редактирование */}
                <Tooltip content="Редактировать">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(participant.id)}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                </Tooltip>

                {/* Удаление */}
                <Tooltip content="Удалить">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(participant)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </Tooltip>
            </div>
        </TableCell>
    )
} 