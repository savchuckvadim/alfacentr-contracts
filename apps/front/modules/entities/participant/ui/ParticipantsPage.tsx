'use client'
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@workspace/ui/components/button';
import { ParticipantsTable } from './components/ParticipantsTable';
import { fetchParticipants, deleteParticipant } from '../model/ParticipantThunk';
import { RootState, AppDispatch } from '@/modules/app/model/store';

import { SmartStageEnum } from '@alfa/entities';
import { Header } from '@/components';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { ParticipantPpkListInfo } from '@/modules/widgetes/Participant';
import { ParticipantStatistics } from './components/ParticipantStatistics';
import { useParticipant } from '../lib/hook/useParticipant';

export function ParticipantsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: participants, loading, error } = useSelector((state: RootState) => state.participant);
  const { deal } = useSelector((state: RootState) => state.app.bitrix);
  const [deletingModalActive, setDeletingModalActive] = useState(false);

  const { 
    activateEditable, 
    cancelEditable, 
    changeEditable } = useParticipant();
  // useEffect(() => {
  //   // if (deal?.ID) {
  //   //   dispatch(fetchParticipants(deal.ID.toString()));
  //   // }
  // }, [dispatch, deal?.ID]);

  const handleEdit = (participant: any) => {
    console.log('Редактирование участника:', participant);
    // Здесь будет логика открытия модального окна редактирования
    alert(`Редактирование участника: ${participant.id}`);
  };

  const handleDelete = async (participantId: number) => {
    try {
      await dispatch(deleteParticipant(participantId)).unwrap();
      // dispatch(removeParticipant(participantId));
    } catch (error) {
      console.error('Ошибка при удалении участника:', error);
      alert('Ошибка при удалении участника');
    }
  };

  const handleAddNew = () => {
    console.log('Добавление нового участника');
    // Здесь будет логика открытия модального окна добавления
    alert('Добавление нового участника');
  };

  return (

    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/bitrix" className="text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
      </div>
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Участники</h1>
          <p className="text-gray-600 mt-1">
            Управление участниками проекта
          </p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Добавить участника</span>
        </Button>
      </div>
      {/* Статистика */}
      <ParticipantStatistics />



      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-800 font-medium">Ошибка загрузки</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deal?.ID && dispatch(fetchParticipants(deal.ID.toString()))}
            className="mt-2"
          >
            Попробовать снова
          </Button>
        </div>
      )}

      {/* Таблица участников */}
      {/* <ParticipantsTable
        participants={participants}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      /> */}
      <ParticipantPpkListInfo />
    </div>
  );
} 