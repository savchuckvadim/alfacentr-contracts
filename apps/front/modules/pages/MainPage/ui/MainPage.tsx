'use client'

import React, { useState } from 'react';

import { SummaryPanel } from '../../../widgetes';

import { MainPageContent } from './components/MainPageContent';

import { useApp } from '@/modules/app/lib/hooks/app';

export const MainPage = () => {
    const { isClient } = useApp();
    if (!isClient) return <div>Loading...</div>;

  

    // if (isLoading) return <PagePreloader />

    return (
        <div className='flex flex-col min-h-full rounded-full'>




            <div className="flex ">

                {/* Левая часть - основная область */}
                <div className="flex-1 p-2">
                    <div className="h-full">
                        {/* <h1 className="text-2xl font-bold mb-2">Основные данные</h1> */}

                        {/* Основной контент */}
                        <MainPageContent />

                    </div>
                </div>

                {/* Правая часть - итоговая панель (1/4 ширины) */}
                <div className="relative min-h-full w-1/4 min-w-[320px] ">
                    <SummaryPanel

                  
                    />
                </div>
            </div>
        </div>
    );
}