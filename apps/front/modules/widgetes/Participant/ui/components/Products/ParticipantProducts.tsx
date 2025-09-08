'use client';

import {
    getParticipantDaysArray,
    getParticipantPrograms,
    IAlfaProduct,
} from '@/modules/entities';
import {
    getMissingProductsByParticipantPpkThemes,
    getMissingProductsByParticipantSeminarDays,
} from '@/modules/features/participant-product/lib/utils/participant-products';

import { Badge } from '@workspace/ui/components/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Package, AlertTriangle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { IParticipant } from '@alfa/entities/';
import { cutString } from '@/modules/lib';
import { Tooltip } from '@/modules/shared';
import { useApp } from '@/modules/app';
import { Products } from './Products';

export const ParticipantProducts = ({
    participantId,
    participant,
    products,
    loading,
    isPpk,
}: {
    participantId: number;
    participant: IParticipant;
    products: IAlfaProduct[] | undefined;
    loading: boolean;
    isPpk: boolean;
}) => {
    const { isClient } = useApp();

    const id = participantId;
    let missingProducts: string[] = [];

    const [expandedSections, setExpandedSections] = useState<{
        programs: boolean;
        products: boolean;
        missing: boolean;
        participantInfo: boolean;
    }>({
        programs: true,
        products: true,
        missing: true,
        participantInfo: true,
    });

    // const products = participantToProducts[id];
    // const seminars = participantToSeminars[id];

    const programs = getParticipantPrograms(participant as IParticipant);
    const programsThemes = programs?.map(program => program.value);
    const days = getParticipantDaysArray(participant as IParticipant);
    if (isPpk) {
        missingProducts = products
            ? getMissingProductsByParticipantPpkThemes(programsThemes, products)
            : [];
    } else {
        missingProducts = products
            ? getMissingProductsByParticipantSeminarDays(days, products)
            : [];
    }

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    return (
        <>
            {/* Назначенные продукты */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">
                            Загрузка товаров...
                        </p>
                    </div>
                </div>
            ) : (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-lg">
                                    {isPpk
                                        ? 'Назначенные товары ППК'
                                        : 'Назначенные товары Семинары'}
                                </CardTitle>
                                <Badge variant="default" className="text-xs">
                                    {products?.length || 0}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSection('products')}
                            >
                                {expandedSections.products
                                    ? 'Скрыть'
                                    : 'Показать'}
                            </Button>
                        </div>
                    </CardHeader>

                    {expandedSections.products && (
                        <CardContent className="space-y-3">
                            {products && products.length > 0 ? (
                                <Products products={products} id={id} />
                            ) : (
                                <div className="text-center py-6">
                                    <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-muted-foreground">
                                        Нет назначенных товаров
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Отсутствующие продукты */}
            {missingProducts && missingProducts.length > 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                <CardTitle className="text-lg text-destructive">
                                    Отсутствующие товары
                                </CardTitle>
                                <Badge
                                    variant="destructive"
                                    className="text-xs"
                                >
                                    {missingProducts.length}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSection('missing')}
                            >
                                {expandedSections.missing
                                    ? 'Скрыть'
                                    : 'Показать'}
                            </Button>
                        </div>
                    </CardHeader>

                    {expandedSections.missing && (
                        <CardContent className="space-y-3">
                            <p className="text-sm text-destructive mb-3">
                                Следующие товары отсутствуют в списке товаров
                                или их количество ограничено:
                            </p>
                            <div className="grid gap-2">
                                {missingProducts.map((productName, index) => (
                                    <Tooltip
                                        key={`participant-${id}-missing-${index}`}
                                        content={
                                            <p className="text-sm max-w-[300px]">
                                                {productName}
                                            </p>
                                        }
                                    >
                                        <div
                                            key={`participant-${id}-missing-${index}`}
                                            className="flex items-center gap-2 p-2 bg-destructive/10 rounded border border-destructive/20"
                                        >
                                            <XCircle
                                                size={16}
                                                className=" text-destructive"
                                            />
                                            <span className="text-sm font-medium">
                                                {cutString(productName, 150)}
                                            </span>
                                        </div>
                                    </Tooltip>
                                ))}
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}
        </>
    );
};
