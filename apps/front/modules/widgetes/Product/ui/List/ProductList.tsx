'use client';

import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';
import { XCircle } from 'lucide-react';
import { ProductListContent } from './components/ProductListContent';
import {
    DocumentGlobalConfig,
    ParticipantsProblems,
} from '@/modules/widgetes/';
import { ProductsFullStatistics } from '../Statistics/ProductsFullStatistics';
import { ProductListTitle } from './components/ProductListTitle';
import { ProductsProblems } from '../Report/ProductsProblems';
import { PagePreloader } from '@/modules/shared';
import { useApp } from '@/modules/app/';

export const ProductList = () => {
    const { loading, error } = useAlfaProducts();
    const { isClient } = useApp();
    if (!isClient) {
        return null;
    }

    if (loading || !isClient) {
        return (
            <PagePreloader text="Загрузка продуктов..." />
            // <div className="flex items-center justify-center h-64">
            //     <div className="text-center">
            //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            //         <p className="text-muted-foreground">Загрузка продуктов...</p>
            //     </div>
            // </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <XCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                    <p className="text-destructive">
                        Ошибка загрузки продуктов
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {loading && !isClient && (
                <PagePreloader text="Загрузка продуктов..." />
            )}
            <div className="space-y-6">
                {/* Заголовок и общая статистика */}
                <div className="space-y-4">
                    <ProductListTitle />
                    {/* Карточки статистики */}
                    <ProductsFullStatistics />
                </div>
                {/* Вкладки с фильтрацией */}
                <ProductListContent />

                {/* Предупреждения */}
                <ProductsProblems />
                <ParticipantsProblems />
            </div>
        </>
    );
};
