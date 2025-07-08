import { useAppSelector } from "@/modules/app/lib/hooks/redux";

export const ContractType = () => {
    const currentContractType = useAppSelector(state => state.contractType.current)
    return <div>
        <p><b>Тип договора:</b> {currentContractType?.name}</p>

    </div>;
};