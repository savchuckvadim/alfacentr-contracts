'use client';
import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';
import { Badge } from '@workspace/ui/components/badge';
import { useProductStatistics } from '../../Statistics/hook/useProductStatistics';
import { useIsUpContractType } from '@/modules/features';

export const ProductListTitle = () => {
    const { items } = useAlfaProducts();
    const { totalSum } = useProductStatistics();
    const { isUp } = useIsUpContractType();

    return (
        <div className="flex items-center justify-between">
            <div>
                {/* <h1 className="text-3xl font-bold">Продукты</h1> */}
                <p className="text-muted-foreground">
                    Управление товарами и статистика
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Badge
                    variant="outline"
                    className="text-sm text-primary font-bold "
                >
                    Всего: {items?.length || 0}
                </Badge>
                {isUp && (
                    <Badge
                        variant="outline"
                        className="text-sm text-primary font-bold "
                    >
                        На сумму: {totalSum}
                    </Badge>
                )}
            </div>
        </div>
    );
};
