import { getParticipantName } from "@/modules/entities"
import { Tooltip } from "@/modules/shared"
import { IParticipant } from "@alfa/entities"
import { CardDescription, CardTitle } from "@workspace/ui/components/card"

import { AlertTriangle, User } from "lucide-react"
import Link from "next/link"

export const ParticipantCardHeaderName = ({ participant, hasProblems }: { participant: IParticipant, hasProblems: boolean }) => {
    return (
        <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                </div>
                <Link className="hover:underline" href={`/bitrix/participants/${participant.id}`}>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Tooltip content={<p className="text-sm w-[300px]">Узнать больше об участнике</p>}>
                                <CardTitle className="text-base">{getParticipantName(participant)}</CardTitle>
                            </Tooltip>

                            {hasProblems && (
                                <div className="p-1 bg-destructive/10 rounded">
                                    <AlertTriangle className="h-3 w-3 text-destructive" />
                                </div>
                            )}
                        </div>
                        <CardDescription className="text-xs">ID: {participant.id}</CardDescription>
                    </div>
                </Link>
            </div>
        </div>
    )
}