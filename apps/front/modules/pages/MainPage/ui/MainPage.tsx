'use client'

import { SummaryPanel } from '../../../widgetes';
import { MainPageContent } from './components/MainPageContent';

export const MainPage = () => {



    return (
        <div className='flex flex-col min-h-full rounded-full'>




            <div className="flex ">

                {/* Левая часть - основная область */}
                <div className="flex-1 p-2">
                    <div className="h-full">
                  
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