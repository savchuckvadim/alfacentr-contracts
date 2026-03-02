'use client';

import React from 'react';
import { Info } from 'lucide-react';
import type { SummaryStatusInfoProps } from './types';

/**
 * Компонент для отображения информационного блока о статусе готовности
 */
export const SummaryStatusInfo: React.FC<SummaryStatusInfoProps> = ({
    title,
    description,
}) => {
    return (
        <aside
            className="bg-blue-50 rounded-lg p-3"
            role="status"
            aria-live="polite"
            aria-label="Информация о статусе"
        >
            <div className="flex items-start space-x-2">
                <Info
                    className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                />
                <div className="text-sm text-blue-800">
                    <p className="font-medium">{title}</p>
                    <p className="text-blue-600 mt-1">{description}</p>
                </div>
            </div>
        </aside>
    );
};
