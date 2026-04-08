'use client';
import { getHasPpk, getHasSeminar, getHasUpComplect, getHasUpVideo } from "../lib/get-product-type.util";
import { useAlfaProducts } from "./useAlfaProducts";

export const useProductType = () => {
    const { items } = useAlfaProducts();
    const hasPpk = getHasPpk(items);
    const hasSeminar = getHasSeminar(items);
    const hasUp = getHasUpComplect(items);
    const hasUpVideo = getHasUpVideo(items);
    return {
        hasPpk,
        hasSeminar,
        hasUp,
        hasUpVideo,
    };
};
