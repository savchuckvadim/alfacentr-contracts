'use client';
import { ComponentPreloader } from '@/modules/shared';
import { useEditParticipant } from '../hook/useParticipantEdit';
import {
    BxParticipantsDataKeys,
    getParticipantSelectItemByValue,
    IParticipant,
} from '@alfa/entities';
import { Button } from '@workspace/ui/components/button';
import { useEffect, useState } from 'react';
import { ModalScreen } from '@/modules/shared';
import { ParticipantEditContent } from './components/ParticipantEditContent';

interface ParticipalEditModalProps {
    isActive: boolean;
    editable: IParticipant;
}

// const generalCodes = [
//     BxParticipantsDataKeys.name,
//     BxParticipantsDataKeys.email,
//     BxParticipantsDataKeys.phone,
//     BxParticipantsDataKeys.format,
//     BxParticipantsDataKeys.address_for_udost,
// ];

// const ppkCodes = [BxParticipantsDataKeys.is_ppk, BxParticipantsDataKeys.days];

export const ppkProgramCodes = [
    BxParticipantsDataKeys.accountant_gos,
    BxParticipantsDataKeys.accountant_medical,
    BxParticipantsDataKeys.kadry,
    BxParticipantsDataKeys.zakupki,
    BxParticipantsDataKeys.corruption,
];

export const ParticipalEditModal = ({
    isActive,
    editable,
}: ParticipalEditModalProps) => {
    const { cancelEditable, updateParticipant, name, isEditLoading } =
        useEditParticipant(editable.id);
    const [isPpk, setIsPpk] = useState(false);

    useEffect(() => {
        editable.fields.forEach(field => {
            if (field.code === BxParticipantsDataKeys.is_ppk) {
                const value = getParticipantSelectItemByValue(
                    field.code,
                    field.value as string,
                );
                if (value?.code === 'yes') {
                    setIsPpk(true);
                } else {
                    setIsPpk(false);
                }
            }
        });
    }, [editable]);

    return (
        <ModalScreen
            isActive={isActive}
            title="Редактирование участника"
            description={`Редактирование данных участника ${name}`}
            onClose={cancelEditable}
            FooterComponent={
                <div className="flex justify-end gap-3 w-full">
                    <Button variant="outline" onClick={cancelEditable}>
                        Отмена
                    </Button>
                    <Button onClick={updateParticipant}>
                        Сохранить изменения
                    </Button>
                </div>
            }
        >
            {isEditLoading ? (
                <div className="flex items-center justify-center h-[77vh] w-full">
                    <ComponentPreloader text="Обновление участника..." />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 h-[77vh] overflow-y-auto p-1">
                    <ParticipantEditContent editable={editable} />
                </div>
            )}
        </ModalScreen>
    );
};
