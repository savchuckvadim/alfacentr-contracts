import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EContractType } from '../model/slice/ContractTypeSlice';
import { useParticipantPpk } from '../../participant-product';

export const useContractType = () => {
    const currentContractType = useAppSelector(
        state => state.contractType.current,
    );
    const { isLoading } = useParticipantPpk();
    const getBadgeColor = (type: EContractType) => {
        // const color = type === EContractType.ppk
        //     ? 'teal-400'
        //     : type === EContractType.seminar
        //         ? 'lime-400'
        //         : type === EContractType.seminar_ppk
        //             ? 'cyan-400'
        //             : type === EContractType.up_complect
        //                 ? 'orange-300'
        //                 : type === EContractType.up_video
        //                     ? 'yellow-400'
        //                     : 'cyan-400';

        return `bg-primary text-background`;
    };

    return {
        isLoading,
        currentContractType,
        currentContractTypeCode: currentContractType?.code,

        getBadgeColor,
    };
};

export const useIsUpContractType = () => {
    const сontractType = useAppSelector(state => state.contractType);
    const isContractTypeLoading = сontractType.loading;
    const currentCode = сontractType?.current?.code;
    const isUp =
        currentCode === EContractType.up_complect ||
        currentCode === EContractType.up_video;

    return {
        isUp,
        isContractTypeLoading,
        currentContractType: сontractType?.current,
    };
};
