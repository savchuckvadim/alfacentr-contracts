'use client';
import React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { SendIcon } from 'lucide-react';
import useDocument from '@/modules/process/document/hook/useDocument';
import { useParticipant } from '@/modules/entities/participant';
import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';

interface SummaryPanelProps {
    className?: string;
}

export function SummaryPanel({ className }: SummaryPanelProps) {
    const { totalProductsCount = 0, totalSum = 0 } = useAlfaProducts();
    const { participantsCount = 0 } = useParticipant();

    const { generateDocument, isLoading } = useDocument();

    return (
        <div className={cn('w-full h-full  p-4 min-h-screen', className)}>
            <Card className="sticky top-35   bg-card ">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold ">
                        Итоговая информация
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Статистика */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="">Всего Товаров:</span>
                            <span className="font-semibold ">
                                {totalProductsCount}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Участников:</span>
                            <span className="font-semibold text-blue-600">
                                {participantsCount}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Общая сумма:</span>
                            <span className="font-semibold text-green-600">
                                {totalSum.toLocaleString('ru-RU')} ₽
                            </span>
                        </div>
                    </div>

                    {/* Дополнительная информация */}
                    <div className="bg-blue-50 rounded-lg p-3 mt-auto">
                        <div className="flex items-start space-x-2">
                            <svg
                                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div className="text-sm text-blue-800">
                                <p className="font-medium">Готово к отправке</p>
                                <p className="text-blue-600 mt-1">
                                    Все данные проверены и готовы для обработки
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Кнопка отправки */}
                    <div className="pt-2 m-auto">
                        <Button
                            onClick={generateDocument}
                            disabled={isLoading || totalProductsCount === 0}
                            className="w-full h-12 text-base font-medium"
                            size="lg"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <svg
                                        className="animate-spin w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span>Отправка...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <SendIcon />
                                    <span>Отправить</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
