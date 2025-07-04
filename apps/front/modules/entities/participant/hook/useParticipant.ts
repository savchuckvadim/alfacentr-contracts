import { useAppSelector } from "@/modules/app/lib/hooks/redux";
import { useSelector } from "react-redux";

export const useParticipant = () => {
    const { items: participants, loading, error } = useAppSelector((state) => state.participant);

    const participantsCount = participants.length
    return {
        participants,
        loading,
        error,
        participantsCount
    }
}

