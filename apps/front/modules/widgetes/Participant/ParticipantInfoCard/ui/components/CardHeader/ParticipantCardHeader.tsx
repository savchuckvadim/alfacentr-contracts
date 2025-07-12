import { CardHeader } from "@workspace/ui/components/card"
import { ParticipantCardHeaderName } from "./ParticipantCardHeaderName"
import { PartisipantCardStatus } from "./PartisipantCardStatus"
import { ParticipantCardWithPpkStatus } from "./ParticipantCardWithPpkStatus"
import { IParticipant } from "@alfa/entities"

export const ParticipantCardHeader = ({ participant, hasProblems }: { participant: IParticipant, hasProblems: boolean }) => {
    return (
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
                <ParticipantCardHeaderName
                    participant={participant}
                    hasProblems={hasProblems} />

                <div className="flex items-center gap-1">
                    <PartisipantCardStatus
                        participant={participant}
                    />

                    <ParticipantCardWithPpkStatus
                        participantId={participant.id}
                    />

                </div>
            </div>
        </CardHeader>
    )
}