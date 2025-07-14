import { useParticipant } from "@/modules/entities"
import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts"
import { useEffect, useState } from "react"
import { useParticipantProductDistribution } from "../hooks"
import { IParicipantPpkThemesStats } from "../type/participant-ppk.type"
import { BxProductRowWithProduct } from "@/modules/entities/product"

export const useProductByParticipants = (productId: number) => {
    const { loading: isParticipantLoading } = useParticipant()
    const { loading: isProductsLoading, items } = useAlfaProducts()
    const product = items.find((item: BxProductRowWithProduct) => item.id === productId)

    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(isParticipantLoading || isProductsLoading)
    }, [isParticipantLoading, isProductsLoading])

    const distribution = useParticipantProductDistribution();
    const participantsPpkTopicsStats = distribution?.participantsPpkTopicsStats

    const getParticipantsCount = (productId: number) => {
        return distribution?.participantToProducts[productId]?.length || 0
    }

    const getIsZeroProduct = (productId: number) => {
        return items.find((item: BxProductRowWithProduct) => item.id === productId)?.quantity === 0
    }

    const isZeroProduct = getIsZeroProduct(productId)
    const participantsCount = getParticipantsCount(productId)
    const potentialParticipantsCount = [] as IParicipantPpkThemesStats[]

    for (const key in participantsPpkTopicsStats) {
        if (participantsPpkTopicsStats[key]) {
            const stats = participantsPpkTopicsStats[key]
            stats.forEach((item: IParicipantPpkThemesStats) => {
                if (item.potintialProduct) {
                    if (item.potintialProduct.id === productId) {
                        potentialParticipantsCount.push(item)
                    }
                }
            })
        }

    }

    return {
        isLoading,
        product,
        isZeroProduct,
        participantsCount,
        potentialParticipantsCount,
    }

}