'use client';
import { ClientTypeSelect } from '@/modules/entities/deal/ui/ClientTypeSelect';
import { ContractType } from '@/modules/features/contract-type/ui/ContractType';
import { DocumentNumber } from '@/modules/features/document-number';
import { ReloadApp, BackButton } from '@/modules/shared';
import { ThemeToggler } from '@workspace/theme';
import { useEffect, useState } from 'react';

export const DocumentGlobalConfig = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="flex  h-14 items-center justify-between p-2 ">
            <div className="flex items-center space-x-2">
                <div className="flex items-center justify-between">
                    <BackButton
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                    />
                </div>
                <div className="w-[200px]">
                    <ClientTypeSelect />
                </div>
                <div className="w-[200px]">
                    <ContractType />
                </div>
                <div className="w-[100px]">
                    <DocumentNumber />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <ThemeToggler />
                <ReloadApp />
            </div>
        </div>
    );
};
