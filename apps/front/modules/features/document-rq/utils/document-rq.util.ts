import { BXRQ, RQ_TYPE } from "@workspace/bx-rq"
import { DocumentRqAgent } from "../model/slice/DocumentRqSlice"

export const getClientRq = (bxRq: BXRQ):DocumentRqAgent => {
    return {
        id: bxRq.ID,
        name: bxRq.NAME,
        based: `bxRq.BASED`,
        // value:` bxRq.VALUE`,
        type: RQ_TYPE.BUDGET,
        inn: `bxRq.INN`,
        kpp: `bxRq.KPP`,
        address: `bxRq.ADDRESS`,
        bank: `bxRq.BANK`,
        phone: `bxRq.PHONE`,
        email: `bxRq.EMAIL`,
    }
}

