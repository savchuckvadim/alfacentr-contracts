'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { SendIcon, Loader2 } from 'lucide-react';
import type { SummarySubmitButtonProps } from './types';

/**
 * Компонент кнопки отправки документа
 */
export const SummarySubmitButton: React.FC<SummarySubmitButtonProps> = ({
    isLoading,
    isDisabled,
    onSubmit,
    loadingText = 'Отправка...',
    defaultText = 'Отправить',
}) => {
    return (
        <Button
            onClick={onSubmit}
            disabled={isDisabled || isLoading}
            className="w-full h-12 text-base font-medium"
            size="lg"
            type="button"
            aria-label={isLoading ? loadingText : defaultText}
            aria-busy={isLoading}
        >
            {isLoading ? (
                <div className="flex items-center space-x-2" role="status">
                    <Loader2
                        className="w-5 h-5 animate-spin"
                        aria-hidden="true"
                    />
                    <span>{loadingText}</span>
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    <SendIcon className="w-5 h-5" aria-hidden="true" />
                    <span>{defaultText}</span>
                </div>
            )}
        </Button>
    );
};
