import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';
import { Badge } from '@workspace/ui/components/badge';
import { useContractType } from '../hooks/use-contract-type.hook';
import { EContractType } from '../model/ContractTypeSlice';
import { Tooltip } from '@/modules/shared';

export const ContractType = () => {
    const { isLoading, currentContractType, badgeColor } = useContractType();
    const currentContractTypeCode = EContractType.up as EContractType;
    return (
        <div>
            {isLoading ? (
                <MicroPreloader />
            ) : (
                // <p className="text-xs">
                //     <b>Тип договора:</b>   <Badge
                //         variant="outline"
                //         className={`text-xs  bg-${badgeColor} ml-2`}
                //         color={badgeColor}
                //     >{currentContractType?.name}
                //     </Badge>
                // </p>
                // <Badge
                //     // variant="outline"
                //     className={`text-xs ${currentContractTypeCode === EContractType.seminar_ppk
                //         ? 'bg-fuchsia-100 text-fuchsia-500 border-fuchsia-600'
                //         : currentContractTypeCode === EContractType.seminar
                //             ? 'bg-sky-400 text-white'
                //             : currentContractTypeCode === EContractType.ppk
                //                 ? 'bg-lime-200 text-lime-900'
                //                 : 'bg-amber-500 text-background'
                //         }`}
                //     color={badgeColor}
                // >{currentContractType?.name}
                // </Badge>
                <Tooltip content="Текущий тип договора">
                    <div>
                        <Badge
                            variant="outline"
                            className="text-xs  text-primary"

                        >
                            {currentContractType?.name}
                        </Badge>
                    </div>
                </Tooltip>
            )}
        </div>
    );
};
