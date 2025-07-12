import { Info } from "@/modules/shared"
import { useParticipantPpk } from "@/modules/features/participant-product/hook/useParticipantPpk"

export const ProductsProblems = () => {
    const {
        isLoading,
        topicStats,
        unassignedParticipants,
    } = useParticipantPpk()

    const totalUnassignedParticipants = unassignedParticipants.length

    const topicsWithDeficit = topicStats.filter(stat => stat.diff < 0).length


    const infoItems: string[] = []
    if (totalUnassignedParticipants > 0) {
        infoItems.push(`${totalUnassignedParticipants} участников не назначены на ППК программы`)
    }
    if (topicsWithDeficit > 0) {
        infoItems.push(`${topicsWithDeficit} тем ППК имеют недостаток мест`)
    }


    return (!isLoading && (totalUnassignedParticipants > 0 || topicsWithDeficit > 0)) && (
        <Info
            collapsible
            title="Требуют внимания"
            items={infoItems}
            type="error"
        />

    )   
}