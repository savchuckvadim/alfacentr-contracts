import { useAppSelector } from '@/modules/app/lib/hooks/redux';

export const useDocumentNumber = () => {
    const { prefix, counter, isLoading, error } = useAppSelector(
        state => state.documentNumber,
    );
    return { prefix, counter, isLoading, error };
};
