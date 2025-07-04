'use client'

import React, { useState } from 'react';
import { Header } from '@/modules/shared';
import { SummaryPanel } from '@/modules/app/widgetes/SummaryPanel';
import { useParticipant } from '../entities/participant';
import Link from 'next/link';

export default function MainPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [summaryData, setSummaryData] = useState({
        totalItems: 156,
        totalAmount: 2450000,
        selectedItems: 23
    });

    const handleSend = async () => {
        setIsLoading(true);

        // Имитация отправки данных
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Обновляем данные после успешной отправки
            setSummaryData(prev => ({
                ...prev,
                selectedItems: 0,
                totalAmount: 0
            }));

            alert('Данные успешно отправлены!');
        } catch (error) {
            alert('Ошибка при отправке данных');
        } finally {
            setIsLoading(false);
        }
    };
    const { participantsCount } = useParticipant()
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Хедер */}
            <Header />

            {/* Основной контент */}
            <div className="flex h-[calc(100vh-64px)]">
                {/* Левая часть - основная область */}
                <div className="flex-1 p-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Главная страница
                            </h1>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Последнее обновление:</span>
                                <span className="text-sm font-medium text-gray-700">
                                    {new Date().toLocaleString('ru-RU')}
                                </span>
                            </div>
                        </div>

                        {/* Основной контент */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Карточка статистики */}
                                <Link href="/participants" className="cursor-pointer">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-blue-600">Участники Семинара</p>
                                                <p className="text-2xl font-bold text-blue-900">{participantsCount}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                {/* Карточка статистики */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600">Завершенные</p>
                                            <p className="text-2xl font-bold text-green-900">8</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Карточка статистики */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600">В процессе</p>
                                            <p className="text-2xl font-bold text-purple-900">4</p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Таблица или список элементов */}
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Последние действия
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4, 5].map((item) => (
                                            <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium text-sm">{item}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Элемент #{item}</p>
                                                        <p className="text-sm text-gray-500">Обновлен {item} минут назад</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-500">Статус:</span>
                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                        Активен
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Правая часть - итоговая панель (1/4 ширины) */}
                <div className="w-1/4 min-w-[320px]">
                    <SummaryPanel
                        summaryData={summaryData}
                        onSend={handleSend}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}