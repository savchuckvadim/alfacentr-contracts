import { getParticipantName, useParticipant } from "@/modules/entities"
import { useParticipantPpk } from "@/modules/features/participant-product/hook/useParticipantPpk"

export const useParticipantsInfo = () => {
    const { loading: isPartisipantsLoading, participants } = useParticipant()

    const participantsIds = participants.map(participant => participant.id)
    const {

        participantToProducts,
        isLoading: isParticipantPpkLoading,
        isParticipantPpk,
        getParticipantProblems,
        getParticipantsProblems
    } = useParticipantPpk()


    const participantsCount = participants.length
    const paricipantWithProblemCount = participantsIds.filter(id => getParticipantProblems(id).hasProblems).length
    const withPpkCount = participantsIds.filter(id => isParticipantPpk(id)).length
    const withoutPpkCount = participantsCount - withPpkCount
    // const participantsProblems = participants.map(participant => {
    //     const { problems } = getParticipantProblems(participant.id)
    //     return {
    //         [participant.id]: {
    //             name: getParticipantName(participant),
    //             problems
    //         }
    //     }
    // })
    // let hasProblems = false
    // participantsProblems.forEach(problem => {
    //     for (const key in problem) {
    //         const typeKey = Number(key) as number
    //         if (problem[typeKey]?.problems && problem[typeKey]?.problems.length > 0) {
    //             hasProblems = true
    //         }
    //     }
    // })
    const { participantsProblems, hasProblems } = getParticipantsProblems(participants)
    return {
        participants,

        isPartisipantsLoading,
        isParticipantPpkLoading,

        participantsCount,
        withPpkCount,
        withoutPpkCount,
        paricipantWithProblemCount,
        participantToProducts,
        participantsProblems,
        hasProblems
    }
}


