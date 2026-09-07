import {
    getParticipantName,
    getProductFieldByCodeValue,
    IAlfaProduct,
} from '@/modules/entities';
import { getParticipantFieldValue } from '@/modules/entities/participant/ui/utils/participant.utils';
import {
    IParticipantPpk,
    ITopicStat,
} from '@/modules/features/participant-product/type/participant-ppk.type';
import {
    AlfaParticipantSmartItemUserFieldsEnum,
    parsePpkEvents,
    EnumPpkApplicationFieldCode,
    EnumPpkApplicationParticipantFieldCode,
    IParticipant,
    IPpkApplicationParticipant,
    IPpkDocumentApplicationData,
} from '@alfa/entities';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export interface GetDocumentPpkApplicationData {
    documentPrefix: string;
    documentCounter: string;

    participants: IParticipantPpk;
    /**
     * Актуальный список участников. Распределение держит снимок объектов,
     * сделанный при его расчете, поэтому даты, сохраненные перед отправкой,
     * нужно читать отсюда — иначе в документ уйдут прежние значения
     */
    allParticipants: IParticipant[];
    name_organization: string;
    position_director: string;
    signature_director: string;
}

export const getDocumentPpkApplicationData = (
    dto: GetDocumentPpkApplicationData,
): IPpkDocumentApplicationData => {
    const date = new Date();

    const day = format(date, 'dd', { locale: ru }); // "09"
    const month = format(date, 'MMMM', { locale: ru }); // "сентября"
    const year = format(date, 'yyyy', { locale: ru }); // "2025"

    return {
        [EnumPpkApplicationFieldCode.prefix]: dto.documentPrefix,
        [EnumPpkApplicationFieldCode.document_number]: dto.documentCounter,
        [EnumPpkApplicationFieldCode.day]: day,
        [EnumPpkApplicationFieldCode.month]: month,
        [EnumPpkApplicationFieldCode.year]: year,
        [EnumPpkApplicationFieldCode.participants]: getDocumentParticipants(
            dto.participants,
            dto.allParticipants,
        ),
        [EnumPpkApplicationFieldCode.name_organization]: dto.name_organization,
        [EnumPpkApplicationFieldCode.position_director]: dto.position_director,
        [EnumPpkApplicationFieldCode.signature_director]:
            dto.signature_director,
    };
};

const getDocumentParticipants = (
    participants: IParticipantPpk,
    allParticipants: IParticipant[],
): IPpkApplicationParticipant[] => {
    const result = [] as IPpkApplicationParticipant[];
    let count = 1;
    for (const topic of Object.values(participants.topicStats)) {
        for (const participant of topic.participants) {
            //актуальная версия участника: в ней лежат только что сохраненные даты
            const actual =
                allParticipants.find(p => p.id === participant.id) ||
                participant;
            const participantData = getDocumentParticipant(
                count,
                actual,
                topic,
            ) as IPpkApplicationParticipant;
            result.push(participantData);
            count++;
        }
    }

    return result;
};

const getDocumentParticipant = (
    index: number,
    participant: IParticipant,
    topic: ITopicStat,
): IPpkApplicationParticipant => {
    const dateStart = getProductDate(topic.products, 'start');
    const dateEnd = getProductDate(topic.products, 'end');

    //даты участия у каждого свои: берем сохраненные по этой программе,
    //а если их нет — откатываемся на даты товара, как было раньше
    const savedEvents = parsePpkEvents(
        participant.fields.find(
            field =>
                field.bitrixId ===
                AlfaParticipantSmartItemUserFieldsEnum.ufCrm12PpkEvents,
        )?.value as string,
    );
    const savedEvent = savedEvents.find(
        event => event.topic === (topic.topic || '').trim(),
    );

    return {
        [EnumPpkApplicationParticipantFieldCode.index]: index.toString(),
        [EnumPpkApplicationParticipantFieldCode.fio]:
            getParticipantName(participant),
        [EnumPpkApplicationParticipantFieldCode.topic]: topic.topic,
        [EnumPpkApplicationParticipantFieldCode.date_start]: formatDocumentDate(
            savedEvent?.dateFrom || dateStart,
        ),
        [EnumPpkApplicationParticipantFieldCode.date_end]: formatDocumentDate(
            savedEvent?.dateTo || dateEnd,
        ),
        [EnumPpkApplicationParticipantFieldCode.email]:
            (getParticipantFieldValue(
                participant,
                AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email,
            ) as string) || '',
        [EnumPpkApplicationParticipantFieldCode.phone]:
            (getParticipantFieldValue(
                participant,
                AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone,
            ) as string) || '',
        [EnumPpkApplicationParticipantFieldCode.participant_id]:
            participant.id?.toString() || '',
    } as IPpkApplicationParticipant;
};

const DOCUMENT_DATE_FORMAT = 'dd.MM.yyyy';
//2026-09-04 и 2026-09-04T00:00:00+03:00
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;
//уже приведенная к документу дата: 04.09.2026
const DOCUMENT_DATE_PATTERN = /^\d{2}\.\d{2}\.\d{4}$/;

/**
 * Дата в человекочитаемом виде для приложения: 04.09.2026.
 *
 * В одну колонку попадают даты из двух источников: персональные хранятся как
 * 2026-09-04 (в этом виде их отдает поле ввода, и в этом же виде их сравнивает
 * ночная задача), а даты товара приходят уже приведенными к локали. Без общего
 * форматирования в одной таблице соседствовали бы 2026-09-04 и 04.09.2026.
 *
 * Хранение при этом не меняется: приводим только то, что уходит в документ
 */
const formatDocumentDate = (value?: string | null): string => {
    const raw = (value || '').trim();
    if (!raw) return '';
    if (DOCUMENT_DATE_PATTERN.test(raw)) return raw;

    const isoParts = ISO_DATE_PATTERN.exec(raw);
    //собираем вручную: new Date('2026-09-04') разбирается как полночь UTC
    //и в часовых поясах западнее Гринвича отдал бы предыдущий день
    if (isoParts) {
        const [, year, month, day] = isoParts;
        return `${day}.${month}.${year}`;
    }

    const parsed = new Date(raw);
    //незнакомый формат не теряем: в ячейке лучше исходное значение, чем пусто
    if (Number.isNaN(parsed.getTime())) return raw;

    return format(parsed, DOCUMENT_DATE_FORMAT, { locale: ru });
};

const getProductDate = (
    products: IAlfaProduct[],
    dateType: 'start' | 'end',
) => {
    const space = '';

    if (dateType === 'start') {
        const value =
            products?.[0] &&
            getProductFieldByCodeValue(products?.[0], 'SEMINAR_START_DATE')
                ?.value;
        return products?.[0] && value && value !== 'Не указано' ? value : space;
    }
    const value =
        products?.[0] &&
        getProductFieldByCodeValue(products?.[0], 'SEMINAR_END_DATE')?.value;
    return products?.[0] && value && value !== 'Не указано' ? value : space;
};
