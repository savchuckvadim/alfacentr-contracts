import { BxParticipantsDataKeys, IParticipant } from '@alfa/entities';

export const getParticipantFieldValue = (
    participant: IParticipant,
    fieldCode: BxParticipantsDataKeys,
) => {
    const field = participant.fields.find(f => f.code === fieldCode);
    return field?.value;
};
