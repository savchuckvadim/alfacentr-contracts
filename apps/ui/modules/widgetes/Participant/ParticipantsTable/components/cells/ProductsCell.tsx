import { TableCell } from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Tooltip } from "@/modules/shared"
import { getProductFieldByCodeValue } from "@/modules/entities"

interface ProductsCellProps {
    assignedProducts: any[]
    participantPpkTopicsStats: any[]
}

export const ProductsCell = ({ assignedProducts, participantPpkTopicsStats }: ProductsCellProps) => {
    const missingProducts = participantPpkTopicsStats.filter(product => product.status !== 'ok')

    const assignedProductsTooltip = (
        <div className="flex flex-col gap-2 w-[300px] ">
            {assignedProducts.map(product => {
                const topic = getProductFieldByCodeValue(product, 'SEMINAR_TOPIC')
                return (
                    <div key={product.id} className="flex flex-col gap-1 text-sm border-b border-border pb-2 last:border-b-0">
                        <div className="font-medium">{product.productName}</div>
                        <div className="flex gap-4 text-xs ">
                            <span>Количество: {product.quantity}</span>
                            <span>Цена: {product.price} ₽</span>
                        </div>
                        {topic?.value && (
                            <div className="text-xs ">
                                Тема: {topic.value}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )

    const missingProductsTooltip = (
        <div className="flex flex-col gap-2 w-[200px] text-foreground">
            {missingProducts.map((product, index) => (
                <div key={`${product.participantId}-${index}`} className="text-sm text-destructive">
                    {product.message}
                </div>
            ))}
        </div>
    )

    if (assignedProducts.length === 0) {
        return (
            <TableCell>
                <Badge variant="destructive" className="text-xs">
                    Нет товаров
                </Badge>
            </TableCell>
        )
    }

    return (
        <TableCell>
            <div className="max-w-md flex flex-wrap gap-1">
                <Tooltip content={assignedProductsTooltip}>
                    <Badge variant="secondary" className="text-xs cursor-help w-20">
                        {assignedProducts.length}
                    </Badge>
                </Tooltip>
                
                {missingProducts.length > 0 && (
                    <Tooltip content={missingProductsTooltip}>
                        <Badge variant="destructive" className="text-xs cursor-help w-20">
                            {missingProducts.length} проблем
                        </Badge>
                    </Tooltip>
                )}
            </div>
        </TableCell>
    )
} 