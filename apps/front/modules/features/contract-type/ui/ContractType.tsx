import { useAppSelector } from "@/modules/app/lib/hooks/redux";
import { useParticipantPpk } from "../../participant-product";
import { MicroPreloader } from "@/modules/shared/Preloader/MicroPreloader";


export const ContractType = () => {
    const currentContractType = useAppSelector(state => state.contractType.current)
    const { isLoading } = useParticipantPpk()
    return <div>
        {isLoading
            ? <MicroPreloader />
            : <p className="text-xs"><b>Тип договора:</b> {currentContractType?.name}</p>}

    </div>;
};