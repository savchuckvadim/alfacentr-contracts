import { getParticipantAddress, getParticipantEmail, getParticipantPhone } from "@/modules/entities"
import { Mail, MapPin, Phone } from "lucide-react"

import { IParticipant } from "@alfa/entities"

export const ParticipantContactInfo = ({ participant }: { participant: IParticipant }) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{getParticipantPhone(participant) || 'Телефон не указан'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{getParticipantEmail(participant) || 'Email не указан'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{getParticipantAddress(participant) || 'Адрес не указан'}</span>
            </div>
        </div>
    )
}