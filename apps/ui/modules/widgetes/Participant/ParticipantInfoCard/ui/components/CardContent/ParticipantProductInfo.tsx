import { Badge } from "@workspace/ui/components/badge"
import { MicroPreloader } from "@/modules/shared/Preloader/MicroPreloader"
import { Package } from "lucide-react"
import { useParticipantInfo } from "../../../hook/useParticipantInfo"

export const ParticipantProductInfo = ({ participantId }: { participantId: number }) => {
    const { assignedProducts, isParticipantPpkLoading } = useParticipantInfo(participantId)
    return (
        <div className="space-y-2 ">
            <div className="flex items-center gap-2">
                <Package className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium">Назначенные продукты:</span>
                {isParticipantPpkLoading ? <MicroPreloader />
                    : <Badge variant="outline" className="text-xs">
                        {assignedProducts.length}
                    </Badge>
                }
            </div>
            {assignedProducts.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {assignedProducts.slice(0, 3).map((product, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                            {product.product?.name || `Продукт ${index + 1}`}
                        </Badge>
                    ))}
                    {assignedProducts.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{assignedProducts.length - 3}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}