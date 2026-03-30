import { useAppSelector } from '@/modules/app/';

import { useParticipantInfo } from '../../ParticipantInfoCard/hook/useParticipantInfo';
import { getIsSeminarProduct, getProductFieldByCodeValue, useParticipant } from '@/modules/entities';
import { BxParticipantsDataKeys } from '@alfa/entities';

export const useEditParticipant = (participantId: number) => {
    const editable = useAppSelector(state => state.participant.editable);
    const isEditLoading = useAppSelector(
        state => state.participant.editLoading,
    );
    const daysSelect = useAppSelector(state => state.seminarDaysSelect.days);
    const participantProduct = useAppSelector(state => state.participantProduct);
    const products = useAppSelector(state => state.product.items);
    const seminarProducts = products.filter(product => getIsSeminarProduct(product));
    const daysSelectBySeminarProducts = seminarProducts.map(product => getProductFieldByCodeValue(product, 'NAME_BID')?.value);


    const {
        name,
        email,
        phone,
        format,
        isPpk,
        programs,
        days,
        activateEditable,
        cancelEditable,
        changeEditable,
        changeMultipleField,
        deleteParticipant,
        updateParticipant,
        formatParticipantPrograms,
    } = useParticipant(participantId);

    const { problems } = useParticipantInfo(participantId);

    const editParticipantTopic = (
        fieldCode: BxParticipantsDataKeys,
        value: string,
    ) => {
        changeEditable(fieldCode, value);
    };
    return {
        isEditLoading,
        editable,
        problems,
        name,
        email,
        phone,
        format,
        isPpk,
        programs,
        days,
        daysSelect,
        activateEditable,
        cancelEditable,
        changeEditable,
        changeMultipleField,
        deleteParticipant,
        updateParticipant,
        editParticipantTopic,
        formatParticipantPrograms,
    };
};
