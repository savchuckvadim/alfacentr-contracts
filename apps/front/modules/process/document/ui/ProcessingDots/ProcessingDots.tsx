'use client';

import { useEffect, useState } from "react";

export const ProcessingDots = () => {
    const [progress, setProgress] = useState(0);
    const updateProgress = () => {
        const value = progress > 2 ? 0 : progress + 1
        setProgress(value)
    }
    useEffect(() => {
        const interval = setInterval(() => {
            updateProgress()
        }, 1200);
        return () => clearInterval(interval);
    }, [progress])

    return (<h1 className="text-left text-lg font-bold">Генерация документа . {progress > 0 && '.'} {progress > 1 && '.'} {progress > 2 && '.'}</h1>);
};
