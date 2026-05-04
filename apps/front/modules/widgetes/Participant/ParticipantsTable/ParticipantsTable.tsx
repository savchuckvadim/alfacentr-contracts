'use client';
import React, { useState } from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';

import { IParticipant } from '@alfa/entities';
import { useParticipant } from '@/modules/entities';
import { DeleteConfirmModal } from '@/modules/entities/participant/ui/components/DeleteConfirmModal';
import { ParticipantTableRowItem } from './components/ParticipantTableRowItem';
import { ParticipalEditModal } from '../ParticipantEdit/ui/ParticipalEditModal';
import { useEditParticipant } from '../ParticipantEdit/hook/useParticipantEdit';
import { useAppSelector } from '@/modules/app';
import { withPpkContractTypeSelector } from '@/modules/features/contract-type';
import { withSeminarContractTypeSelector } from '@/modules/features/contract-type';

export function ParticipantsTable() {
    const withSeminarType = useAppSelector(withSeminarContractTypeSelector);
    const withPpkType = useAppSelector(withPpkContractTypeSelector);

    const { participants, loading } = useParticipant();

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        participant: IParticipant | null;
    }>({
        isOpen: false,
        participant: null,
    });

    const handleDeleteClick = (participant: IParticipant) => {
        setDeleteModal({
            isOpen: true,
            participant,
        });
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, participant: null });
    };
    const { editable } = useEditParticipant(0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                    <svg
                        className="animate-spin w-5 h-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span className="text-gray-600">
                        Загрузка участников...
                    </span>
                </div>
            </div>
        );
    }

    if (participants.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Участники не найдены
                </h3>
                <p className="text-gray-500">
                    Добавьте первого участника для начала работы
                </p>
                {editable && (
                <ParticipalEditModal
                    isActive={!!editable}
                    editable={editable}
                />
            )}
            </div>
        );
    }

    return (
        <>
            <div className="text-foreground rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>ФИО</TableHead>
                            {/* <TableHead>Email</TableHead>
                            <TableHead>Телефон</TableHead> */}
                            <TableHead>Формат</TableHead>

                            {withSeminarType && (
                                <TableHead>Дни участия</TableHead>
                            )}

                            {withSeminarType && <TableHead>Семинары</TableHead>}
                            <TableHead className="w-20">ППК</TableHead>
                            {withPpkType && <TableHead>Программы</TableHead>}
                            {withPpkType && <TableHead>ППК</TableHead>}
                            <TableHead className="w-32">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.map((participant, index) => {
                            return (
                                <ParticipantTableRowItem
                                    key={participant.id}
                                    participant={participant}
                                    index={index}
                                    handleDeleteClick={handleDeleteClick}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <DeleteConfirmModal
                participant={deleteModal.participant}
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                // onConfirm={handleDeleteConfirm}
                // isLoading={loading}
            />
            {editable && (
                <ParticipalEditModal
                    isActive={!!editable}
                    editable={editable}
                />
            )}
        </>
    );
}
