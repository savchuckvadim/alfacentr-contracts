import { useAppSelector } from "@/modules/app/lib/hooks/redux";
import { IParticipant } from "@alfa/entities";

export const useParticipantData = (id?: number) => {
    const { items, loading, error, editLoading } = useAppSelector((state) => state.participant);
    const participant = items.find((p) => p.id === id);
    const participantsCount = items.length;

    return {
        participant,
        participants: items,
        loading,
        editLoading,
        error,
        participantsCount
    };
}; 