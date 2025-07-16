import { useAppSelector } from "@/modules/app/lib/hooks/redux"
import { getIsPpkProduct, getIsSeminarProduct, getIsSeminarPpkProduct, getIsUpProduct } from "../lib/get-product-type.util"
import { IAlfaProduct } from "../model/ProductSlice"
import { getProductQuantity, getProductSum } from "../lib/product-sum.util"

export const useAlfaProducts = () => {
  const { items, loading, error } = useAppSelector((state) => state.product)
  const ppkProducts = items.filter(product => getIsPpkProduct(product)) as IAlfaProduct[]
  const seminarProducts = items.filter(product => getIsSeminarProduct(product)) as IAlfaProduct[]
  const seminarPpkProducts = items.filter(product => getIsSeminarPpkProduct(product)) as IAlfaProduct[]
  const upProducts = items.filter(product => getIsUpProduct(product)) as IAlfaProduct[]
  const totalSum = getProductSum(items)
  const totalProductsCount = getProductQuantity(items)



  return {
    items, loading, error,
    ppkProducts, seminarProducts,
    seminarPpkProducts,
    upProducts,
    totalSum,
    totalProductsCount
  }
}

