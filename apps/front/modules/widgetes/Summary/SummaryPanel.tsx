'use client';

import React, { useMemo } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import useDocument from '@/modules/process/document/hook/useDocument';
import { useParticipant } from '@/modules/entities/participant';
import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';
import {
    SummaryStatistics,
    // SummaryStatusInfo,
    SummarySubmitButton,
} from './components';
import { useIsUpContractType } from '@/modules/features';

/**
 * Пропсы для компонента SummaryPanel
 */
export interface SummaryPanelProps {
    /** Дополнительные CSS классы для контейнера */
    className?: string;
}

/**
 * Компонент панели с итоговой информацией о товарах, участниках и общей сумме
 * Отображает статистику и позволяет отправить документ на генерацию
 */
export const SummaryPanel: React.FC<SummaryPanelProps> = ({ className }) => {
    const { totalProductsCount = 0, totalSum = 0 } = useAlfaProducts();
    const { participantsCount = 0 } = useParticipant();
    const { generateDocument, isLoading } = useDocument();
    const { isUp } = useIsUpContractType();
    const isSubmitDisabled = useMemo(
        () => isLoading || totalProductsCount === 0,
        [isLoading, totalProductsCount],
    );

    const handleSubmit = (): void => {
        generateDocument();
    };

    return (
        <aside
            className={cn('w-full h-full p-4 min-h-screen', className)}
            aria-label="Панель итоговой информации"
        >
            <Card className="sticky top-35 bg-card">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">
                        Итоговая информация
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <SummaryStatistics
                        totalProductsCount={totalProductsCount}
                        participantsCount={participantsCount}
                        totalSum={totalSum}
                        isUp={isUp}
                    />

                    {/* <SummaryStatusInfo
                        title="Готово к отправке"
                        description="Все данные проверены и готовы для обработки"
                    /> */}

                    <div className="pt-2">
                        <SummarySubmitButton
                            isLoading={isLoading}
                            isDisabled={isSubmitDisabled}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </CardContent>
            </Card>
        </aside>
    );
};
