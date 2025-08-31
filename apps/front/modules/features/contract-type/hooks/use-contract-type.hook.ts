import { useAppSelector } from "@/modules/app/lib/hooks/redux";
import { EContractType } from "../model/ContractTypeSlice";
import { useParticipantPpk } from "../../participant-product";

export const useContractType = () => {
    const currentContractType = useAppSelector(
        state => state.contractType.current,
    );
    const { isLoading } = useParticipantPpk();
    const badgeColor = currentContractType?.code === EContractType.ppk
        ? 'primary'
        : currentContractType?.code === EContractType.seminar
            ? 'secondary'
            : currentContractType?.code === EContractType.seminar_ppk
                ? 'amber-500'
                : currentContractType?.code === EContractType.up
                    ? 'secondary'
                    : 'secondary';

    return {
        isLoading,
        currentContractType,
        currentContractTypeCode: currentContractType?.code,
        badgeColor,
    };
}
