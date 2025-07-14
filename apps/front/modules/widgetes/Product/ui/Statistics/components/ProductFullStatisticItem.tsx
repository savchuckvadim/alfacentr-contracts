import { SimpleCard } from "@/modules/shared"
import { Badge } from "@workspace/ui/components/badge"


export interface ProductFullStatisticItemProps {
    title: string
    items: {
        title: string
        value: number,
        isDestructive?: boolean
    }[]
    isBigBadge?: boolean
}
export const ProductFullStatisticItem = ({ title, items, isBigBadge }: ProductFullStatisticItemProps) => {
    return <SimpleCard
        title={title}

    >
        <div className="space-y-2">
            {items.map((item) => (
                <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{item.title}</span>
                    <Badge variant={item.isDestructive ? "destructive" : "default"} className={`text-xs h-5 ${isBigBadge ? "w-15" : "w-5 "}`}>{item.value}</Badge>
                </div>
            ))}
        </div>
    </SimpleCard>
}