import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';
import { useDocumentNumber } from '../hooks/document-number.hook';

export const DocumentNumber = () => {
    const { prefix, counter, isLoading, error, fetched } = useDocumentNumber();
    if (isLoading || !fetched) {
        return <MicroPreloader />;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    return (
        <div>
            {prefix}-{counter}
        </div>
    );
};
