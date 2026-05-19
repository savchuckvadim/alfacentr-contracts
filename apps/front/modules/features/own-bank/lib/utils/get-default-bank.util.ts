import { ALFA_RQ_DATA } from "@alfa/entities"
import { TOwnBankValue } from "../../type/save.type";

export const getDefaultBank = (): TOwnBankValue => {
    return ALFA_RQ_DATA['sber'] as TOwnBankValue ;
}
