'use client';

import { IAlfaProduct } from '@/modules/entities';
import {
    getIsPpkProduct,
    getIsSeminarProduct,
    getProductTypeName,
    getIsUpProduct,
    getIsUpSpecialProduct,
} from '@/modules/entities/product/lib/get-product-type.util';
import {
    getProductFormat,
    getProductPrefix,
} from '@/modules/entities/product/lib/get-product-format.util';
import { useParticipantPpk } from '@/modules/features/participant-product';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

import {
    Package,
    Hash,
    Monitor,
    MapPin,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@workspace/ui/lib/utils';
import { Tooltip } from '@/modules/shared';
import { ProductInfo } from './components/ProductInfo';
import { ProductStatistics } from './components/ProductStatistics';

interface IProductCardProps {
    product: IAlfaProduct;
}

export const ProductCard = ({ product }: IProductCardProps) => {
    const productType = getProductTypeName(product);
    const isPpk = getIsPpkProduct(product);

    const isSeminar = getIsSeminarProduct(product);
    const isUp = getIsUpProduct(product);
    const isUpSpecial = getIsUpSpecialProduct(product);
    const { productToParticipants } = useParticipantPpk();

    // Получаем количество назначенных участников
    const assignedParticipants =
        productToParticipants[product.id?.toString() || ''] || [];
    const assignedCount = assignedParticipants.length;

    // Определяем цвет бейджа для типа продукта

    const getTypeBadgeColor = () => {
        if (isPpk) return 'bg-foreground text-background' as const;
        if (isSeminar) return 'bg-foreground text-background' as const;
        if(isUpSpecial) return 'bg-violet-500 text-zinc-50' as const;
        if (isUp) return 'bg-orange-500 text-zinc-50' as const;
        return 'bg-secondary' as const;
    };

    // Определяем статус заполненности для ППК продуктов
    // const getAvailabilityStatus = () => {
    //     if (!isPpk || !product) return null;

    //     // const { needed, available, diff } = productStats
    //     const diff = (product.quantity || 0) - assignedCount;

    //     if (diff < 0)
    //         return {
    //             status: 'deficit',
    //             message: `Слишком много участников: ${Math.abs(diff)} мест`,
    //             variant: 'destructive' as const,
    //         };
    //     if (diff > 0)
    //         return {
    //             status: 'surplus',
    //             message: `Слишком мало участников: ${diff} свободных мест`,
    //             variant: 'destructive' as const,
    //         };
    //     return {
    //         status: 'balanced',
    //         message: 'Мест достаточно',
    //         variant: 'default' as const,
    //     };
    // };

    // const availabilityStatus = getAvailabilityStatus();

    return (
        <Card className="w-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">
                            {product.productName ||
                                product.product?.name ||
                                'Без названия'}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm">
                            <Tooltip content="Перейти к товару в Bitrix24">
                                <Link
                                    className="hover:text-primary/80"
                                    target="_blank"
                                    href={`https://alfacentr.bitrix24.ru/crm/catalog/24/product/${product.productId}/`}
                                >
                                    ID: {product.productId}• Тип:{' '}
                                    {productType.toUpperCase()}
                                </Link>
                            </Tooltip>
                        </CardDescription>
                    </div>
                    <Badge
                        variant={'default'}
                        className={cn(
                            'ml-4 shrink-0 text-sm px-1 py-1',
                            getTypeBadgeColor(),
                        )}
                    >
                        <p className="text-xs">{productType.toUpperCase()}</p>
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Основная информация о продукте */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <span className="text-primary font-bold text-sm">
                                ₽
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                {product.price || 0} ₽
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Цена
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-secondary/10 rounded-lg">
                            <Package className="h-4 w-4 text-secondary-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                {product.quantity || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Количество
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                            <span className="text-green-600 font-bold text-sm">
                                ₽
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                {(product.price || 0) * (product.quantity || 0)}{' '}
                                ₽
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Сумма
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                            <Hash className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                {getProductPrefix(product)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Префикс
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                            {getProductFormat(product)
                                .toLowerCase()
                                .includes('дистанционно') ? (
                                <Monitor className="h-4 w-4 text-purple-600" />
                            ) : (
                                <MapPin className="h-4 w-4 text-purple-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                {getProductFormat(product)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Место проведения
                            </p>
                        </div>
                    </div>
                </div>

                {/* Статистика ППК для продуктов типа ППК */}

                <ProductStatistics product={product} />

                <ProductInfo
                    product={product}
                    isPpk={isPpk}
                    assignedCount={assignedCount}
                />
            </CardContent>
        </Card>
    );
};
