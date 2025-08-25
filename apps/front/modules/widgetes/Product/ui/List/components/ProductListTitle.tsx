import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';
import { Badge } from '@workspace/ui/components/badge';

export const ProductListTitle = () => {
    const { items } = useAlfaProducts();

    return (
        <div className="flex items-center justify-between">
            <div>
                {/* <h1 className="text-3xl font-bold">Продукты</h1> */}
                <p className="text-muted-foreground">
                    Управление товарами и статистика
                </p>
            </div>
            <Badge variant="outline" className="text-sm">
                Всего: {items?.length || 0}
            </Badge>
        </div>
    );
};
