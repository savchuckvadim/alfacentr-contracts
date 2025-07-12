import { useAppSelector } from "@/modules/app"
import { useParticipant } from "@/modules/entities"
import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts"
import { useEffect, useState } from "react"

export const useProductsByParticipants = () => {
    const { loading: isParticipantLoading } = useParticipant()
    const { loading: isProductsLoading } = useAlfaProducts()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(isParticipantLoading || isProductsLoading)
    }, [isParticipantLoading, isProductsLoading])
    const products = useAppSelector(state => state.product.items)

    //сколько продуктов с 0  и каких
    // у сколькоих можно увеличить количества товара - и каких и насколько
    // сколько товаров отсутствует но темы в участниках заявлены и каких

}