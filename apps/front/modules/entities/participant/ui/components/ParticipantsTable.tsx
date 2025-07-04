'use client'
import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { IParticipant } from '@alfa/entities';
import {
  getParticipantName,
  getParticipantEmail,
  getParticipantPhone,
  getParticipantFormat,
  getParticipantIsPpk,
  formatParticipantPrograms
} from '../utils/participant.utils';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface ParticipantsTableProps {
  participants: IParticipant[];
  onEdit: (participant: IParticipant) => void;
  onDelete: (participantId: number) => void;
  isLoading?: boolean;
}

export function ParticipantsTable({
  participants,
  onEdit,
  onDelete,
  isLoading = false
}: ParticipantsTableProps) {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    participant: IParticipant | null;
  }>({
    isOpen: false,
    participant: null
  });

  const handleDeleteClick = (participant: IParticipant) => {
    setDeleteModal({
      isOpen: true,
      participant
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.participant) {
      onDelete(deleteModal.participant.id);
      setDeleteModal({ isOpen: false, participant: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, participant: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Загрузка участников...</span>
        </div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Участники не найдены</h3>
        <p className="text-gray-500">Добавьте первого участника для начала работы</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-background text-foreground rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Формат</TableHead>
              <TableHead>Программы</TableHead>
              <TableHead className="w-20">ППК</TableHead>
              <TableHead className="w-32">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant, index) => {
              const name = getParticipantName(participant);
              const email = getParticipantEmail(participant);
              const phone = getParticipantPhone(participant);
              const format = getParticipantFormat(participant);
              const isPpk = getParticipantIsPpk(participant);
              const programs = formatParticipantPrograms(participant);

              return (
                <TableRow key={participant.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-500">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{name || 'Не указано'}</div>
                      <div className="text-sm text-gray-500">ID: {participant.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {email}
                      </a>
                    ) : (
                      <span className="text-gray-400">Не указан</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {phone}
                      </a>
                    ) : (
                      <span className="text-gray-400">Не указан</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format ? (
                      <Badge variant="secondary" className="text-xs">
                        {format}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Не указан</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {programs !== 'Не выбрано' ? (
                        <div className="text-sm text-gray-700 line-clamp-2">
                          {programs}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Не выбрано</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isPpk ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Да
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Нет
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(participant)}
                        className="h-8 w-8 p-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(participant)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmModal
        participant={deleteModal.participant}
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />
    </>
  );
} 