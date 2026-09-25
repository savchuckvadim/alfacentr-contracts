'use client';

import {
    CommunicationsConfirmMenu,
    ContactSyncConfirmMenu,
} from '@/modules/features';
import { SummaryPanel } from '../../../widgetes';
import { MainPageContent } from './components/MainPageContent';
import { useEffect, useState } from 'react';
import { Processing, useDocument } from '@/modules/process';
export const MainPage = () => {
    const [isClient, setIsClient] = useState(false);
    const { isLoading: isProcessing } = useDocument();
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col  rounded-full">
            <CommunicationsConfirmMenu />
            <ContactSyncConfirmMenu />
            {isProcessing && <Processing />}
            <div className="flex ">
                {/*
                    Левая часть - основная область. min-w-0 обязателен:
                    flex-элемент не ужимается меньше содержимого, и широкая
                    таблица (приложение ППК с длинными программами) иначе
                    растягивала колонку и выталкивала правую панель за экран,
                    а overflow-x-auto внутри таблиц никогда не срабатывал
                */}
                <div className="min-w-0 flex-1 p-2">
                    <div className="h-full">
                        <MainPageContent />
                    </div>
                </div>

                {/* Правая часть - итоговая панель (1/4 ширины) */}
                <div className="relative min-h-full w-1/4 min-w-[320px] ">
                    <SummaryPanel />
                </div>
            </div>
        </div>
    );
};
