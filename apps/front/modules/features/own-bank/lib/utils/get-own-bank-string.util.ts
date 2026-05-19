import { TOwnBankValue } from "../../type/save.type";

export const getOwnBankString = (ownBank: TOwnBankValue | null) => {
    if (!ownBank) {
        return '';
    }
    const { bik, bankName, bankAddress, ks, rs } = ownBank;

    const string = `р/с ${rs} \n
в банке ${bankName} ${bankAddress},\n
БИК ${bik}, к/с ${ks}`

    return string;

}
