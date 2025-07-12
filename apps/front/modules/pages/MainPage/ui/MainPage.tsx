'use client'

import React, { useState } from 'react';
import { SummaryPanel } from '@/modules/app/widgetes/SummaryPanel';
import { useParticipant } from '../../../entities/participant';
import Link from 'next/link';

import { useDeal } from '../../../entities/deal';
import { DealInfo } from '../../../entities/deal/ui/DealInfo';
import { ContractType } from '../../../features/contract-type';
import { ClientTypeSelect } from '../../../entities/deal/ui/ClientTypeSelect';
import { DocumentGlobalConfig } from '../../../widgetes';
import { ProductTable } from '../../../entities/product/ui/ProductTable';
import { ProductsTable } from '../../../entities/product/ui/components/ProductsTable';
import { ParticipantsTable } from '../../../widgetes/Participant/ParticipantsTable/ParticipantsTable';
import { Card, CardContent } from '@workspace/ui/components/card';
import { CardHeader } from '@workspace/ui/components/card';
import { CardTitle } from '@workspace/ui/components/card';
import { MainPageContent } from './components/MainPageContent';

export const MainPage = () => {
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
 
    return (
        <div>


            <DocumentGlobalConfig />

            <div className="flex h-[calc(100vh-64px)] bg-sidebar">

                {/* Левая часть - основная область */}
                <div className="flex-1 p-4">
                    <div className=" p-3 h-full">
                        {/* <h1 className="text-2xl font-bold mb-2">Основные данные</h1> */}

                        {/* Основной контент */}
                        <MainPageContent />
                      
                    </div>
                </div>

                {/* Правая часть - итоговая панель (1/4 ширины) */}
                <div className="w-1/4 min-w-[320px] ">
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