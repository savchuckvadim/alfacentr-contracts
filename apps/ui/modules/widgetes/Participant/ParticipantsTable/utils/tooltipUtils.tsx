import { getProductFieldByCodeValue } from "@/modules/entities"

export const createProgramsTooltip = (participantPpkTopicsStats: any[]) => (
    <div className="flex flex-col gap-2 w-[200px]">
        {participantPpkTopicsStats.map((topic, index) => (
            <div key={`${topic.participantId}-${index}`} className="text-sm">
                {topic.topic}
            </div>
        ))}
    </div>
)

export const createAssignedProductsTooltip = (assignedProducts: any[]) => (
    <div className="flex flex-col gap-2 w-[200px] text-foreground">
        {assignedProducts.map(product => {
            const topic = getProductFieldByCodeValue(product, 'SEMINAR_TOPIC')
            return (
                <div key={product.id} className="flex flex-col gap-1 text-sm border-b border-border pb-2 last:border-b-0">
                    <div className="font-medium">{product.productName}</div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Количество: {product.quantity}</span>
                        <span>Цена: {product.price} ₽</span>
                    </div>
                    {topic?.value && (
                        <div className="text-xs text-primary">
                            Тема: {topic.value}
                        </div>
                    )}
                </div>
            )
        })}
    </div>
)

export const createMissingProductsTooltip = (participantPpkTopicsStats: any[]) => {
    const missingProducts = participantPpkTopicsStats.filter(product => product.status !== 'ok')
    
    return (
        <div className="flex flex-col gap-2 w-[200px] text-foreground">
            {missingProducts.map((product, index) => (
                <div key={`${product.participantId}-${index}`} className="text-sm text-destructive">
                    {product.message}
                </div>
            ))}
        </div>
    )
} 