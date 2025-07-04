'use client'

import { initial } from "../model/AppThunk";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "../providers/ErrorBoundary";
import { logClient } from "../lib/helper/logClient";
import { LoadingScreen } from "@/modules/shared";
import StartPage from "@/modules/pages/StartPage";
import { useAppDispatch, useAppSelector } from "../lib/hooks/redux";
import MainPage from "@/modules/pages/MainPage";


const App = ({ inBitrix, envBitrix }: { inBitrix: boolean, envBitrix: boolean | string | undefined }) => {
    console.log('ALFA APP')
    console.log('envBitrix', envBitrix)

    return (
        <ErrorBoundary>
            <AppRoot inBitrix={inBitrix} />
        </ErrorBoundary>
    )
}

const AppRoot = ({ inBitrix }: { inBitrix: boolean }) => {
    const dispatch = useAppDispatch();
    const app = useAppSelector((state) => state.app);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && !app.initialized && !app.isLoading) {
            dispatch(initial(inBitrix));
        }
    }, [isClient, app.initialized, app.isLoading, dispatch, inBitrix]);

    if (!isClient) {
        return <LoadingScreen />;
    }
    logClient('Afa start', {
        level: 'info',
        context: 'Alfa LOG TEST',
        message: 'Alfa is mounted',
    });
    return (

        <div className="min-h-screen bg-background">


            {app.initialized ? (
                <AppContent />
            ) : (
                <StartPage />
            )}
        </div>

    );
};

const AppContent = () => {
    return <MainPage />
};

export default App