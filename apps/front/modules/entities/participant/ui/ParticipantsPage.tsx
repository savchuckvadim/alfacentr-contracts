'use client'
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@workspace/ui/components/button';
import { fetchParticipants, deleteParticipant } from '../model/ParticipantThunk';
import { RootState, AppDispatch } from '@/modules/app/model/store';

import { ParticipantPpkListInfo } from '@/modules/widgetes/Participant';
import { ParticipantStatistics } from './components/ParticipantStatistics';
import { useParticipant } from '../lib/hook/useParticipant';

export function ParticipantsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: participants, loading, error } = useSelector((state: RootState) => state.participant);
  const { deal } = useSelector((state: RootState) => state.app.bitrix);
  const [deletingModalActive, setDeletingModalActive] = useState(false);



  const handleAddNew = () => {
    console.log('Добавление нового участника');
    // Здесь будет логика открытия модального окна добавления
    alert('Добавление нового участника');
  };

  return (

    <div className="space-y-6">
     
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

   
      <ParticipantPpkListInfo />
    </div>
  );
} 