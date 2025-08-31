'use client';

import { CommunicationsConfirmMenu } from '@/modules/features';
import { SummaryPanel } from '../../../widgetes';
import { MainPageContent } from './components/MainPageContent';
import { useEffect, useState } from 'react';

export const MainPage = () => {

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col  rounded-full">
            <CommunicationsConfirmMenu />
            <div className="flex ">
                {/* Левая часть - основная область */}
                <div className="flex-1 p-2">
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
