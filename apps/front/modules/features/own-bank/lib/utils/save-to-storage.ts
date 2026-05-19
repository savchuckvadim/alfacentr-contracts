import { TFieldItem } from "@alfa/entities";
import { STORAGE_KEY } from "../../type/save.type";


export const saveCurrentToLocalStorage = (item: TFieldItem): void => {
    const itemCode = item.code;
    if (!itemCode) {
        return;
    }

    localStorage.setItem(STORAGE_KEY, itemCode);
};
