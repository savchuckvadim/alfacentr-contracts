import { SimpleCard } from "@/modules/shared"
import { Badge } from "@workspace/ui/components/badge"


export interface ProductFullStatisticItemProps {
    title: string
    items: {
        title: string
        value: number,
        isDestructive?: boolean
    }[]
}
export const ProductFullStatisticItem = ({ title, items }: ProductFullStatisticItemProps) => {
    return <SimpleCard
        title={title}

    >
        <div className="space-y-2">
            {items.map((item) => (
                <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{item.title}</span>
                    <Badge variant={item.isDestructive ? "destructive" : "default"} className="text-xs">{item.value}</Badge>
                </div>
            ))}
        </div>
    </SimpleCard>
}