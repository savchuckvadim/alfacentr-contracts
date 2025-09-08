import { getParticipantName, getProductFieldByCodeValue, IAlfaProduct } from "@/modules/entities";
import { IParticipantPpk, ITopicStat } from "@/modules/features/participant-product/type/participant-ppk.type";
import { EnumPpkApplicationFieldCode, EnumPpkApplicationParticipantFieldCode, IParticipant, IPpkApplicationParticipant, IPpkDocumentApplicationData} from "@alfa/entities";





export interface GetDocumentPpkApplicationData {
    documentPrefix: string;
    documentCounter: string;
    day: string;
    month: string;
    year: string;
    participants: IParticipantPpk;
    name_organization: string;
    position_director: string;
    signature_director: string;
}



export const getDocumentPpkApplicationData = (dto: GetDocumentPpkApplicationData): IPpkDocumentApplicationData => {
    return {
        [EnumPpkApplicationFieldCode.prefix]: dto.documentPrefix,
        [EnumPpkApplicationFieldCode.document_number]: dto.documentCounter,
        [EnumPpkApplicationFieldCode.day]: dto.day,
        [EnumPpkApplicationFieldCode.month]: dto.month,
        [EnumPpkApplicationFieldCode.year]: dto.year,
        [EnumPpkApplicationFieldCode.participants]: getDocumentParticipants(dto.participants),
        [EnumPpkApplicationFieldCode.name_organization]: dto.name_organization,
        [EnumPpkApplicationFieldCode.position_director]: dto.position_director,
        [EnumPpkApplicationFieldCode.signature_director]: dto.signature_director,
    };
};


const getDocumentParticipants = (participants: IParticipantPpk): IPpkApplicationParticipant[] => {
    const result = [] as IPpkApplicationParticipant[];
    let count = 1;
    for (const topic of Object.values(participants.topicStats)) {
        for (const participant of topic.participants) {

            const participantData = getDocumentParticipant(count, participant, topic) as IPpkApplicationParticipant;
            result.push(participantData);
            count++;
        }
    }

    return result;
};


const getDocumentParticipant = (index: number, participant: IParticipant, topic: ITopicStat): IPpkApplicationParticipant => {

    const dateStart = getProductDate(topic.products, 'start')
    const dateEnd = getProductDate(topic.products, 'end');

    return {
        [EnumPpkApplicationParticipantFieldCode.index]: index.toString(),
        [EnumPpkApplicationParticipantFieldCode.fio]: getParticipantName(participant),
        [EnumPpkApplicationParticipantFieldCode.topic]: topic.topic,
        [EnumPpkApplicationParticipantFieldCode.date_start]: dateStart,
        [EnumPpkApplicationParticipantFieldCode.date_end]: dateEnd,
    } as IPpkApplicationParticipant;
};



const getProductDate = (products: IAlfaProduct[], dateType: 'start' | 'end') => {
    let space = '';

    if (dateType === 'start') {
        const value = products?.[0] && getProductFieldByCodeValue(products?.[0], 'SEMINAR_START_DATE')?.value
        return products?.[0] && value && value !== 'Не указано'
            ? value
            : space;
    }
    const value = products?.[0] && getProductFieldByCodeValue(products?.[0], 'SEMINAR_END_DATE')?.value
    return products?.[0] && value && value !== 'Не указано'
        ? value
        : space;
};
