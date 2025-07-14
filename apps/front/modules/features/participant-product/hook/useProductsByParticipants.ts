import { useParticipant } from "@/modules/entities"
import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts"
import { useEffect, useState } from "react"
import { useParticipantProductDistribution } from "../hooks"
import { BxProductRowWithProduct } from "@/modules/entities/product"

export const useProductsByParticipants = () => {
    const { loading: isParticipantLoading } = useParticipant()
    const { loading: isProductsLoading, items } = useAlfaProducts()


    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(isParticipantLoading || isProductsLoading)
    }, [isParticipantLoading, isProductsLoading])

    const distribution = useParticipantProductDistribution();
    //сколько продуктов с 0  и каких
    // у сколькоих можно увеличить количества товара - и каких и насколько
    // сколько товаров отсутствует но темы в участниках заявлены и каких
    const zeroProducts: BxProductRowWithProduct[] = []
    items.forEach((item: BxProductRowWithProduct)    => {
        if (item.quantity === 0) {
            zeroProducts.push(item)
        }
    })



    return {
        isLoading,
        zeroProducts,
    }

}