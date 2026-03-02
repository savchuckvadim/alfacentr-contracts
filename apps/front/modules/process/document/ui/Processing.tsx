'use client';

import { useEffect, useState } from "react";

export const Processing = () => {
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

    return (
        <div className="fixed inset-0 backdrop-blur-xl flex items-center justify-center z-50">
            <div className="bg-background text-primary p-10 rounded-[18px] w-[340px]">
                <h1 className="text-left text-lg font-bold">Генерация документа . {progress > 0 && '.'} {progress > 1 && '.'} {progress > 2 && '.'}</h1>
            </div>
        </div>
    );
};
