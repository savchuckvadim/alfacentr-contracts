'use client'
import React, { useEffect, useState } from 'react';

import { getParticipantName } from '../utils/participant.utils';
import { IParticipant } from '@alfa/entities';
import { useParticipant } from '../../lib/hook/useParticipant';
import { ModalConfirm } from '@/modules/shared';

interface DeleteConfirmModalProps {
  participant: IParticipant | null;
  isOpen: boolean;
  onClose: () => void;
  // onConfirm: () => void;
  // isLoading?: boolean;
}

export function DeleteConfirmModal({
  participant,
  isOpen,
  onClose,

}: DeleteConfirmModalProps) {
  if (!isOpen || !participant) return null;

  const participantName = getParticipantName(participant);
  const { deleteParticipant, editLoading: isLoading } = useParticipant(participant.id);
  const [deleted, setDeleted] = useState(false)
  const handleDelete = () => {
    deleteParticipant(participant.id)
    setDeleted(true)
  }

  useEffect(() => {
    if (deleted && !isLoading) {
      onClose()
    }
  }, [deleted, isLoading])

  return (
    <ModalConfirm
      title="Удаление участника"
      warning="Вы уверены, что хотите удалить участника?"
      onConfirm={handleDelete}
      onCancel={onClose}
      message={participantName}
      type="delete"
      isOpen={isOpen}
      isLoading={isLoading}
    />
  );
} 