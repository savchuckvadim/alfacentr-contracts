import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';
import { Badge } from '@workspace/ui/components/badge';
import { useContractType } from '../hooks/use-contract-type.hook';
import { EContractType } from '../model/slice/ContractTypeSlice';
import { Tooltip } from '@/modules/shared';
import { cn } from '@workspace/ui/lib/utils';

export const ContractType = () => {
    const { isLoading, currentContractType } = useContractType();


    const getTypeBadgeColor = () => {
        if (currentContractType?.code === EContractType.ppk) return 'bg-blue-500 text-zinc-50' as const;
        if (currentContractType?.code === EContractType.seminar) return 'bg-green-400 text-background' as const;
        if (currentContractType?.code === EContractType.seminar_ppk) return 'bg-indigo-400 text-zinc-50' as const;
        if(currentContractType?.code === EContractType.up_special) return 'bg-violet-600 text-zinc-50' as const;
        if (currentContractType?.code === EContractType.up_complect || currentContractType?.code === EContractType.up_video) return 'bg-orange-500 text-zinc-50' as const;
        return 'bg-secondary' as const;
    };

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
                                `${getTypeBadgeColor()}`,
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
