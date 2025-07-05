import { useAppSelector } from "@/modules/app/lib/hooks/redux"

export const useAlfaProducts = () => {
    const { items, loading, error } = useAppSelector((state) => state.product)
    return { items, loading, error }
}

