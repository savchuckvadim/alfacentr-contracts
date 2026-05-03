'use client';

import type { ReactNode } from 'react';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft } from 'lucide-react';

export function BackButton(): ReactNode {
    const handleGoBack = () => {
        if (typeof window !== 'undefined') {
            window.history.back();
        }
    };

    return (
        <Button
            onClick={handleGoBack}
            variant="outline"
            size="lg"
            className="w-full max-w-xs group hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
        >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Вернуться назад
        </Button>
    );
}
