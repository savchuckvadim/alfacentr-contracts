import { IParticipant } from "@alfa/entities";
import { getParticipantEmail, getParticipantFormat, getParticipantIsPpk, getParticipantName, getParticipantPhone } from "../ui";
import { formatParticipantPrograms } from "../ui/utils/participant.utils";

export const useParticipantFormatters = () => {
    return {
        getName: (participant: IParticipant) => getParticipantName(participant),
        getEmail: (participant: IParticipant) => getParticipantEmail(participant),
        getPhone: (participant: IParticipant) => getParticipantPhone(participant),
        getFormat: (participant: IParticipant) => getParticipantFormat(participant),
        getIsPpk: (participant: IParticipant) => getParticipantIsPpk(participant),
        formatPrograms: (participant: IParticipant) => formatParticipantPrograms(participant),
        
        // Дополнительные форматтеры
        getFullName: (participant: IParticipant) => {
            const name = getParticipantName(participant);
            return name || 'Имя не указано';
        },
        
        getContactInfo: (participant: IParticipant) => {
            const email = getParticipantEmail(participant);
            const phone = getParticipantPhone(participant);
            return { email, phone };
        },
        
        getProgramsList: (participant: IParticipant) => {
            const programs = formatParticipantPrograms(participant);
            return programs ? programs.split(', ') : [];
        }
    };
}; 