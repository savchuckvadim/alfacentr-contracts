import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';
import { Badge } from '@workspace/ui/components/badge';
import { useContractType } from '../hooks/use-contract-type.hook';
import { EContractType } from '../model/slice/ContractTypeSlice';
import { Tooltip } from '@/modules/shared';
import { cn } from '@workspace/ui/lib/utils';

export const ContractType = () => {
    const { isLoading, currentContractType, getBadgeColor } = useContractType();

    return (
        <div>
            {isLoading || !currentContractType ? (
                <MicroPreloader />
            ) : (
                <Tooltip content="Текущий тип договора">
                    <div>
                        <Badge
                            variant="outline"
                            className={cn(
                                `text-xs text-black ml-2`,
                                `${getBadgeColor(currentContractType?.code as EContractType)}`,
                            )}
                        >
                            {currentContractType?.name}
                        </Badge>
                    </div>
                </Tooltip>
            )}
        </div>
    );
};
