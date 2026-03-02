import {
    getHasPpk,
    getHasSeminar,
    getHasSeminarPpk,
    getHasUpComplect,
    getHasUpVideo,
    IAlfaProduct,
} from '@/modules/entities/product';
import { EContractType } from '../../model/slice/ContractTypeSlice';

export const getContractTypeByProducts = (
    products: IAlfaProduct[],
): EContractType => {
    // let contractType = EContractType.seminar;
    const hasPpk = getHasPpk(products);
    const hasSeminar = getHasSeminar(products);
    const hasSeminarPpk = getHasSeminarPpk(products);
    const hasUpComplect = getHasUpComplect(products);
    const hasUpVideo = getHasUpVideo(products);

    if (hasSeminarPpk) {
        return EContractType.seminar_ppk;
    }
    if (hasPpk) {
        return EContractType.ppk;
    }
    if (hasSeminar) {
        return EContractType.seminar;
    }
    if (hasUpComplect) {
        return EContractType.up_complect;
    }
    if (hasUpVideo) {
        return EContractType.up_video;
    }
    return EContractType.seminar;
};
