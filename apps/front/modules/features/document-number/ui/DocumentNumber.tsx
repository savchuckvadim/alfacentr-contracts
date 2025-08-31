import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';
import { useDocumentNumber } from '../hooks/document-number.hook';
import { Badge } from '@workspace/ui/components/badge';
import { Tooltip } from '@/modules/shared';

export const DocumentNumber = () => {
    const { prefix, counter, isLoading, error, fetched } = useDocumentNumber();
    if (isLoading || !fetched) {
        return <MicroPreloader />;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    return (
        <Tooltip content="Текущий номер договора">
            <div>
                <Badge
                    variant="outline"
                    className="text-xs  text-primary"

                >
                    {prefix}-{counter}
                </Badge>
            </div>
        </Tooltip>
    );
};
