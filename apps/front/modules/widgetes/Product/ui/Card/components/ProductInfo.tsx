import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { ChevronDown, ChevronUp, Hash } from 'lucide-react';

import { getProductFieldValue, IAlfaProduct } from '@/modules/entities/product';
import { filterProductFieldsForDetails } from '@/modules/entities/product';

export interface IProductInfoProps {
    product: IAlfaProduct;
    isPpk: boolean;
    assignedCount: number;
}
export const ProductInfo = ({
    product,
    isPpk,
    assignedCount,
}: IProductInfoProps) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <>
            {' '}
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
                        <span className="text-sm">
                            Дополнительная информация
                        </span>
                        {showDetails ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
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
                                <span className="text-sm font-medium">
                                    Дополнительные поля
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filterProductFieldsForDetails(
                                    product.fields,
                                ).map((field, index) => {
                                    const { name, value } =
                                        getProductFieldValue(field);
                                    return (
                                        <div
                                            key={index}
                                            className="bg-muted/30 rounded-lg p-3"
                                        >
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {name || field.bitrixId}
                                            </p>
                                            <p className="text-sm font-medium">
                                                {value}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
