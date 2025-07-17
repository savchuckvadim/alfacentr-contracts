import { MicroPreloader } from "@/modules/shared/Preloader/MicroPreloader"
import { useParticipantInfo } from "../../../hook/useParticipantInfo"
import { Badge } from "@workspace/ui/components/badge"

export const ParticipantCardWithPpkStatus = ({ participantId }: { participantId: number }) => {
    const { isParticipantPpkLoading, isPpk } = useParticipantInfo(participantId)
    return (
        <>
            {isParticipantPpkLoading
                ? <MicroPreloader /> : <Badge variant={isPpk ? "default" : "secondary"} className="text-xs">
                    {isPpk ? 'ППК' : 'Без ППК'}
                </Badge>
            }

        </>
    )
}