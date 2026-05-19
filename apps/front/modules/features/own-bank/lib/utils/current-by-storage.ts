import { documentFields, EnumDealDocumentFieldCode, TFieldItem } from "@alfa/entities";
import { STORAGE_KEY } from "../../type/save.type";

export const getCurrentByLocalStorage = (): TFieldItem | null => {

    const currentItemCode = localStorage.getItem(STORAGE_KEY);
    if (!currentItemCode) {
        return null;
    }


    const bankField = documentFields[EnumDealDocumentFieldCode.BANK];
    if (!bankField) {
        return null;
    }
    const currentItem = bankField.list.find(item => item.code === currentItemCode);
    if (!currentItem) {
        return null;
    }
    return currentItem;

};
