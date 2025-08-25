import {
    getHasPpk,
    getHasSeminar,
    getHasSeminarPpk,
    getHasUp,
    IAlfaProduct,
} from '@/modules/entities/product';
import { EContractType } from '../../model/ContractTypeSlice';

export const getContractTypeByProducts = (
    products: IAlfaProduct[],
): EContractType => {
    // let contractType = EContractType.seminar;
    const hasPpk = getHasPpk(products);
    const hasSeminar = getHasSeminar(products);
    const hasSeminarPpk = getHasSeminarPpk(products);
    const hasUp = getHasUp(products);
    if (hasSeminarPpk) {
        return EContractType.seminar_ppk;
    }
    if (hasPpk) {
        return EContractType.ppk;
    }
    if (hasSeminar) {
        return EContractType.seminar;
    }
    if (hasUp) {
        return EContractType.up;
    }
    return EContractType.seminar;
    // products.forEach(product => {
    //     product.fields.forEach(field => {
    //         const value =
    //             typeof field.value === 'string'
    //                 ? field.value.toLowerCase()
    //                 : (field.value as any)?.value
    //                   ? (field.value as any).value.toLowerCase()
    //                   : '';
    //         if (value.includes('ппк')) {
    //             contractType = EContractType.seminar_ppk;
    //         }
    //     });
    // });
    // return contractType;
};
