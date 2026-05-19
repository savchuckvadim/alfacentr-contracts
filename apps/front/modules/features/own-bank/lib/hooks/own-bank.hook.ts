import { useAppDispatch, useAppSelector } from "@/modules/app";
import { useCallback } from "react";
import { updateOwnBank } from "../../model/thunk/DealOwnBankThunk";
import { getOwnBankString } from "../utils/get-own-bank-string.util";

export const useOwnBank = () => {
    const dispatch = useAppDispatch();
    const ownBank = useAppSelector(state => state.ownBank);
    const setCurrent = useCallback((code: string) => {
        dispatch(updateOwnBank({ code }));
    }, [dispatch]);

    const ownBankString = getOwnBankString(ownBank.bank);
    return { ownBank, ownBankString, setCurrent };
};
