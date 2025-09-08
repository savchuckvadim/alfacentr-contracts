import { getProductFieldByCodeValue, IAlfaProduct } from '@/modules/entities';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { getIsSeminarProduct } from '@/modules/entities/product/lib/get-product-type.util';
import { is } from 'date-fns/locale';
import { CheckCircle, Trash2 } from 'lucide-react';

export const Products = ({
    products,
    id,
}: {
    products: IAlfaProduct[] | undefined;
    id: number;
}) => {
    // const handleRemoveProduct = (index: number) => {
    //     // TODO: Добавить логику удаления продукта
    //     console.log('Remove product at index:', index);
    // };
    return (
        <div className="grid gap-3">
            {products?.map((product, index) => {
                const productTopicName = getProductFieldByCodeValue(
                    product,
                    'NAME_BID',
                )?.value;

                if (!productTopicName) return null;
                const isSeminar = getIsSeminarProduct(product);
                const productSeminarName = getProductFieldByCodeValue(
                    product,
                    'SEMINAR_TOPIC',
                )?.value;

                return (
                    <div
                        key={`participant-${id}-product-${index}`}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <Badge variant="default" className="text-xs">
                                    Назначен
                                </Badge>
                            </div>
                            {isSeminar && productSeminarName && <p>
                                <span className="text-xs text-muted-foreground">
                                    Тема: {productSeminarName}
                                </span>
                            </p>}
                            <p className="text-sm font-medium">
                                {productTopicName}
                            </p>
                            <p className="text-xs text-muted-foreground">

                                ID: {product.id} • {product.productName} • Цена:{' '}
                                {product.price || 0} ₽
                            </p>
                        </div>
                        {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduct(index)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button> */}
                    </div>
                );
            })}
        </div>
    );
};
