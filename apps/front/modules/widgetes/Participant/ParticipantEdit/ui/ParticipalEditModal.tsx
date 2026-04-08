'use client';
import { ComponentPreloader } from '@/modules/shared';
import { useEditParticipant } from '../hook/useParticipantEdit';
import {
    BxParticipantsDataKeys,
    IParticipant,
} from '@alfa/entities';
import { Button } from '@workspace/ui/components/button';
import { ModalScreen } from '@/modules/shared';
import { ParticipantEditContent } from './components/ParticipantEditContent';
import { useParticipant } from '@/modules/entities';
import { useEffect, useState } from 'react';
import { useProductType } from '@/modules/entities/product/hook/useProductType';

interface ParticipalEditModalProps {
    isActive: boolean;
    editable: IParticipant;
}


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
    const { addParticipant } = useParticipant();
    const isCreating = editable.id === 0;
    const participantName =
        (editable.fields.find(field => field.code === BxParticipantsDataKeys.name)
            ?.value as string) || '';
    const isNameValid = participantName.trim().length > 0;

    const handleSubmit = () => {
        if (isCreating) {
            if (!isNameValid) {
                return;
            }
            addParticipant();
            return;
        }
        updateParticipant();
    };

    return (
        <ModalScreen
            isActive={isActive}
            title={isCreating ? 'Добавление участника' : 'Редактирование участника'}
            description={
                isCreating
                    ? 'Заполните данные нового участника'
                    : `Редактирование данных участника ${name}`
            }
            onClose={cancelEditable}
            FooterComponent={
                <div className="flex items-center justify-between gap-3 w-full">
                    <div className="text-sm text-destructive">
                        {isCreating && !isNameValid
                            ? 'Поле "ФИО" обязательно для заполнения'
                            : null}
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={cancelEditable}>
                            Отмена
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isCreating && !isNameValid}
                        >
                            {isCreating
                                ? 'Добавить участника'
                                : 'Сохранить изменения'}
                        </Button>
                    </div>
                </div>
            }
        >
            {isEditLoading ? (
                <div className="flex items-center justify-center h-[77vh] w-full">
                    <ComponentPreloader
                        text={
                            isCreating
                                ? 'Добавление участника...'
                                : 'Обновление участника...'
                        }
                    />
                </div>
            ) : (
                <div className="w-full h-[77vh]">
                    <ParticipantEditContent editable={editable} />
                </div>
            )}
        </ModalScreen>
    );
};
