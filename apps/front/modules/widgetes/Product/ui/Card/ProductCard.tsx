'use client'

import { IAlfaProduct } from "@/modules/entities";
import { getProductType, getIsPpkProduct, getIsSeminarProduct, getProductTypeName, getIsUpProduct } from "@/modules/entities/product/lib/get-product-type.util";
import { getProductFormat, getProductPrefix } from "@/modules/entities/product/lib/get-product-format.util";
import { useParticipantPpk } from "@/modules/features/participant-product";
import { getParticipantName } from "@/modules/entities/participant/ui/utils/participant.utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Users, Package, Hash, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Monitor, MapPin, CreditCard } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { filterProductFieldsForDetails, getProductFieldValue } from "@/modules/entities/product";
import { cn } from "@workspace/ui/lib/utils";
import { LinkBadge } from "@/modules/shared";

interface IProductCardProps {
    product: IAlfaProduct
}

export const ProductCard = ({ product }: IProductCardProps) => {
    const productType = getProductTypeName(product)
    const isPpk = getIsPpkProduct(product)
    const isSeminar = getIsSeminarProduct(product)
    const isUp = getIsUpProduct(product)
    const {
        topicStats,
        // participantToProducts,
        productToParticipants,
        // unassignedParticipants,
        // isProductPpk,
        // isParticipantPpk
    } = useParticipantPpk()

    const [showDetails, setShowDetails] = useState(false)

    // Получаем статистику для данного продукта
    const productStats = topicStats.find(stat =>
        stat.products.some(p => p.id === product.id)
    )

    // Получаем количество назначенных участников
    const assignedParticipants = productToParticipants[product.id?.toString() || ''] || []
    const assignedCount = assignedParticipants.length

    // Определяем цвет бейджа для типа продукта

    const getTypeBadgeColor = () => {
        if (isPpk) return "bg-indigo-700 text-zinc-50" as const
        if (isSeminar) return "bg-foreground text-background" as const
        if (isUp) return "bg-orange-700 text-zinc-50" as const
        return "bg-secondary" as const
    }

    // Определяем статус заполненности для ППК продуктов
    const getAvailabilityStatus = () => {
        if (!isPpk || !product) return null

        // const { needed, available, diff } = productStats
        const diff = (product.quantity || 0) - assignedCount

        if (diff < 0) return { status: "deficit", message: `Слишком много участников: ${Math.abs(diff)} мест`, variant: "destructive" as const }
        if (diff > 0) return { status: "surplus", message: `Слишком мало участников: ${diff} свободных мест`, variant: "destructive" as const }
        return { status: "balanced", message: "Мест достаточно", variant: "default" as const }
    }

    const availabilityStatus = getAvailabilityStatus()
    
    return (
        <Card className="w-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">
                            {product.productName || product.product?.name || 'Без названия'}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm">
                            <Link target="_blank" href={`https://alfacentr.bitrix24.ru/crm/catalog/24/product//${product.productId}/`}>
                                ID: {product.productId} • Тип: {productType.toUpperCase()}
                            </Link>
                        </CardDescription>
                    </div>
                    <Badge variant={'default'} className={cn("ml-4 shrink-0 text-sm px-3 py-1", getTypeBadgeColor())}>
                        {productType.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Основная информация о продукте */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <span className="text-primary font-bold text-sm">₽</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{product.price || 0} ₽</p>
                            <p className="text-xs text-muted-foreground">Цена</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-secondary/10 rounded-lg">
                            <Package className="h-4 w-4 text-secondary-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{product.quantity || 0}</p>
                            <p className="text-xs text-muted-foreground">Количество</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                            <span className="text-green-600 font-bold text-sm">₽</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{(product.price || 0) * (product.quantity || 0)} ₽</p>
                            <p className="text-xs text-muted-foreground">Сумма</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                            <Hash className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{getProductPrefix(product)}</p>
                            <p className="text-xs text-muted-foreground">Префикс</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                            {getProductFormat(product).toLowerCase().includes('дистанционно') ? (
                                <Monitor className="h-4 w-4 text-purple-600" />
                            ) : (
                                <MapPin className="h-4 w-4 text-purple-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{getProductFormat(product)}</p>
                            <p className="text-xs text-muted-foreground">Место проведения</p>
                        </div>
                    </div>
                </div>

                {/* Статистика ППК для продуктов типа ППК */}
                {isPpk &&  (
                    <div className="space-y-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Статистика ППК</span>
                            </div>
                            {availabilityStatus && (
                                <Badge variant={availabilityStatus.variant} className="text-xs">
                                    {availabilityStatus.status === "deficit" && <AlertTriangle className="h-3 w-3 mr-1" />}
                                    {availabilityStatus.message}
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Количество товара</span>
                                </div>
                                <p className="text-lg font-bold">{product.quantity}</p>
                            </div>

                            {/* <div className="bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Package className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Доступно</span>
                                </div>
                                <p className="text-lg font-bold">{productStats.available}</p>
                            </div> */}

                            <div className="bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Количество  участников</span>
                                </div>
                                <p className="text-lg font-bold">{assignedCount}</p>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Package className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Участники</span>
                                </div>
                                {assignedParticipants.map((participant) => (
                                    <div key={participant.id} className="flex items-center gap-2 p-1">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <span className="text-sm">
                                            <LinkBadge href={`/bitrix/participants/${participant.id}`} text="К участнику" name={getParticipantName(participant) || `Участник ${participant.id}`} />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Дополнительная информация для семинаров */}
                {/* {isSeminar && (
                    <div className="pt-3 border-t">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Семинар</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Количество мест: {product.quantity || 0} • Цена: {product.price || 0} ₽
                        </p>
                    </div>
                )} */}

                {/* Кнопка для показа дополнительной информации */}
                {(product.fields?.length > 0 || (isPpk && assignedCount > 0)) && (
                    <div className="pt-3 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                            className="w-full justify-between"
                        >
                            <span className="text-sm">Дополнительная информация</span>
                            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>
                )}

                {/* Выезжающий блок с дополнительной информацией */}
                {showDetails && (
                    <div className="pt-3 border-t space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Назначенные участники для ППК */}
                        {/* {isPpk && assignedCount > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Назначенные участники</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {assignedParticipants.map((participant) => (
                                        <div key={participant.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded border">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            <span className="text-sm">
                                                {getParticipantName(participant) || `Участник ${participant.id}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}

                        {/* Дополнительные поля продукта */}
                        {product.fields && product.fields.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Дополнительные поля</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filterProductFieldsForDetails(product.fields).map((field, index) => {
                                        const { name, value } = getProductFieldValue(field)
                                        return (
                                            <div key={index} className="bg-muted/30 rounded-lg p-3">
                                                <p className="text-xs text-muted-foreground mb-1">{name || field.bitrixId}</p>
                                                <p className="text-sm font-medium">
                                                    {value}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}