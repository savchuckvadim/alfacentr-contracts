import { TableCell, TableRow } from "@workspace/ui/components/table";
import { IParticipant } from "@alfa/entities";
import Link from "next/link";
import { useEditParticipant } from "../../ParticipantEdit/hook/useParticipantEdit";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Eye } from "lucide-react";
import { Tooltip } from "@/modules/shared";
import { useParticipantInfo } from "../../ParticipantInfoCard/hook/useParticipantInfo";


interface ParticipantTableRowItemProps {
    participant: IParticipant;
    index: number;
    handleDeleteClick: (participant: IParticipant) => void;
    
}
export function ParticipantTableRowItem({
    participant, index, handleDeleteClick

}: ParticipantTableRowItemProps) {

    const {
        activateEditable,
     
        name,
        email,
        phone,
        format,
        isPpk,
        programs,
    } = useEditParticipant(participant.id)

    return (
        <TableRow key={participant.id} className="hover:bg-card-muted">
            <TableCell className="font-medium text-gray-500">
                {index + 1}
            </TableCell>
            <TableCell>
                <div>
                    <Link href={`/participants/${participant.id}`}>
                        <div className="cursor-pointer font-medium text-gray-900">{name || 'Не указано'}</div>
                        <div className="text-sm text-gray-500">ID: {participant.id}</div>
                    </Link>
                </div>
            </TableCell>
            <TableCell>
                {email ? (
                    <a
                        href={`mailto:${email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        {email}
                    </a>
                ) : (
                    <span className="text-gray-400">Не указан</span>
                )}
            </TableCell>
            <TableCell>
                {phone ? (
                    <a
                        href={`tel:${phone}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        {phone}
                    </a>
                ) : (
                    <span className="text-gray-400">Не указан</span>
                )}
            </TableCell>
            <TableCell>
                {format ? (
                    <Badge variant="secondary" className="text-xs">
                        {format}
                    </Badge>
                ) : (
                    <span className="text-gray-400">Не указан</span>
                )}
            </TableCell>
            <TableCell className="h-full">
                <div className="max-w-md h-full">
                    {programs !== 'Не выбрано' ? (
                        <div className="text-sm text-gray-700 line-clamp-2 min-h-full">
                            {programs}
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm">Не выбрано</span>
                    )}
                </div>
            </TableCell>
            <TableCell>
                {isPpk ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Да
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-gray-500">
                        Нет
                    </Badge>
                )}
            </TableCell>
            <TableCell>
                <div className="flex items-center space-x-1">
                    <Link href={`/participants/${participant.id}`}>
                        <Tooltip
                            content={<p>Подробнее</p>}

                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                // onClick={() => onEdit(participant)}
                                className="h-8 w-8 p-0"
                            >
                                {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg> */}
                                <Eye className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </Link>


                    {/* <Link href={`/participants/${participant.id}`}> */}
                    <Tooltip
                        content={<p>Редактировать</p>}

                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => activateEditable(participant.id)}
                            className="h-8 w-8 p-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </Button>
                    </Tooltip>
                    {/* </Link> */}

                    <Tooltip
                        content={<p>Удалить</p>}

                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(participant)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </Button>
                    </Tooltip>
                </div>
            </TableCell>
        </TableRow>
    )
}