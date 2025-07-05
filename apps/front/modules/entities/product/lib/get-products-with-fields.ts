import { bxProductData } from "@alfa/entities"
import { BxProductRowWithProduct, IAlfaProduct, IProductField } from "../model/ProductSlice"
import { IBXProduct } from "@bitrix/index"

export const getProductsWithFields = (rowsWithProducts: BxProductRowWithProduct[]): IAlfaProduct[] => {
    const productTypeObject = bxProductData as Record<string, { bitrixId: string, name: string, userType: string, isMultiple: boolean }>

    const alfaProducts: IAlfaProduct[] = []
    rowsWithProducts.forEach(row => {
        const product = row.product
        const fields = getFields(product, productTypeObject)
        const alfaProduct: IAlfaProduct = {
            ...row,
            fields: fields
        }
        alfaProducts.push(alfaProduct)
    })


    return alfaProducts;
}

const getFields = (product: IBXProduct, productTypeObject: Record<string, { bitrixId: string, name: string, userType: string, isMultiple: boolean }>) => {
    const fields: IProductField[] = []
    for (const key in productTypeObject) {
        const currentProductType = productTypeObject[key]
        if (currentProductType) {
            const field = getFieldd(product, currentProductType) as IProductField
            fields.push(field)
        }
    }
    return fields
}
const getFieldd = (product: IBXProduct, productTypeObject: {
    bitrixId: string
    name: string
    userType: string
    isMultiple: boolean

}) => {

    const bitrixId = productTypeObject?.bitrixId as string
    const fieldValue = product[bitrixId]

    const field = {
        bitrixId: bitrixId,
        name: productTypeObject?.name,
        userType: productTypeObject?.userType,
        isMultiple: productTypeObject?.isMultiple,
        value: fieldValue
    } as IProductField
    return field
}