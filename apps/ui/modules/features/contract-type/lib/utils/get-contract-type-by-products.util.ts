
import {  IAlfaProduct } from "@/modules/entities/product";
import { EContractType } from "../../model/ContractTypeSlice";

export const getContractTypeByProducts = (products: IAlfaProduct[]): EContractType => {
    let contractType = EContractType.seminar
    products.forEach(product => {
        
        product.fields.forEach(field => {
           const value = typeof field.value === 'string' ? field.value.toLowerCase() : (field.value as any)?.value ? (field.value as any).value.toLowerCase() : ''
           if(value.includes('ппк')){
            contractType = EContractType.seminar_ppk
           }
          
        })
       

    })
    return contractType
}