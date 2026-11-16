import {
    AlfaParticipantSmartItemUserFieldsEnum as Fields,
    IAlfaParticipantSmartItem,
} from '@alfa/entities';

/** Длинный список в комментарии читать невозможно, да и незачем */
export const MAX_PARTICIPANTS_IN_COMMENT = 10;

const asText = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : '';

const asList = (value: unknown): string[] =>
    Array.isArray(value) ? value.map(asText).filter(Boolean) : [];

/** Участник без имени — всё равно участник, показываем по порядковому номеру */
const getName = (
    participant: IAlfaParticipantSmartItem,
    index: number,
): string =>
    asText(participant[Fields.ufCrm12Name]) ||
    asText(participant.title) ||
    `Участник ${index + 1}`;

/**
 * Комментарий о заведённых участниках.
 *
 * Видно, кого именно создала заявка: при разборе обращений это сразу
 * отвечает на вопрос «а почему участников больше, чем в заявке» —
 * повторный приём задваивал их молча, в таймлайне следов не оставалось.
 */
export const renderParticipantsForTimeline = (
    participants: IAlfaParticipantSmartItem[],
): string => {
    const lines = [`👥 [B]Заведены участники: ${participants.length}[/B]`];

    for (const [index, participant] of participants
        .slice(0, MAX_PARTICIPANTS_IN_COMMENT)
        .entries()) {
        const details: string[] = [];

        const email = asText(participant[Fields.ufCrm12Email]);
        if (email) details.push(email);

        const phone = asText(participant[Fields.ufCrm12Phone]);
        if (phone) details.push(phone);

        const days = asList(participant[Fields.ufCrm12Days]);
        if (days.length) details.push(`дней: ${days.length}`);

        if (asText(participant[Fields.ufCrm12IsPpk])) details.push('ППК');

        const suffix = details.length ? ` — ${details.join(', ')}` : '';
        lines.push(`• ${getName(participant, index)}${suffix}`);
    }

    if (participants.length > MAX_PARTICIPANTS_IN_COMMENT) {
        lines.push(
            `• и ещё ${participants.length - MAX_PARTICIPANTS_IN_COMMENT}`,
        );
    }

    return lines.join(' \n');
};
