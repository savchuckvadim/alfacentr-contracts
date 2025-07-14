import { useParticipant } from "@/modules/entities"
import { IRaitingCardProps } from "@/modules/shared/Cards/Rating/RaitingCard"
import { RatingCards } from "@/modules/shared/Cards/Rating/RatingCards"
import { SmartStageEnum } from "@alfa/entities"

export const ParticipantStatistics = () => {
    const { participants, participantsCount, loading, error } = useParticipant()
    const cards = [
        {
            title: 'Всего участников',
            value: participantsCount,
            icon: 'people',
            color: 'blue'
        },
        {
            title: 'Активные',
            value: participants.filter(p => p.stage === SmartStageEnum.CLIENT).length,
            icon: 'check',
            color: 'green'
        },
        {
            title: 'В процессе',
            value: participants.filter(p => p.stage === SmartStageEnum.PREPARATION).length,
            icon: 'clock',
            color: 'yellow'
        },
        {
            title: 'Завершенные',
            value: participants.filter(p => p.stage === SmartStageEnum.SUCCESS).length,
            icon: 'star',
            color: 'purple'
        },
        

    ] as IRaitingCardProps[]
    return (
        <RatingCards cards={cards} />
    )
}