'use client';

// import { logClient } from '../lib/helper/logClient';
import { LoadingScreen } from '@/modules/shared';
import { useApp } from '../lib/hooks/app';
import { store } from '../model/store';
import { useEffect, useState } from 'react';

export const App = ({ children }: { children: React.ReactNode }) => {
    const { initialized, isLoading, isClient, hasCompany } = useApp();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            if (isMounted) {
                if (typeof window !== 'undefined') {
                    // logClient('Afa start', {
                    //     level: 'info',
                    //     context: 'Alfa LOG TEST',
                    //     message: 'Alfa is mounted',
                    // });

                    (window as any).store = store;
                }
            }
        }
    }, [isMounted]);
    return (
        <div className="h-calc(100vh - 300px)">
            {isClient && initialized && !isLoading && hasCompany ? (
                children
            ) : (
                <LoadingScreen />
            )}
        </div>
    );
};

export default App;
