'use client';

import {
    DocumentRqsPreview,
    useDocumentRq,
} from '@/modules/features/document-rq';
import { useDocumentParagraph } from '@/modules/features/document-paragraph';
import { SimpleCard } from '@/modules/shared';

export const ContractPreview = () => {
    const { header } = useDocumentRq();

    console.log(header);
    const { paragraph, totalSum } = useDocumentParagraph();

    return (
        <div className="flex flex-col gap-4">
            <SimpleCard
                withCollapse={true}
                title="Шапка договора"
                children={<p>{header}</p>}
            />

            {paragraph && (
                <SimpleCard
                    withCollapse={true}
                    title="Пункт 1.1.2"
                    children={<p>{paragraph}</p>}
                />
            )}
            <SimpleCard
                withCollapse={true}
                title="Общая стоимость услуг"
                children={<p>{totalSum}</p>}
            />
            <SimpleCard
                withCollapse={true}
                title="Реквизиты"
                children={<DocumentRqsPreview />}
            />
        </div>
    );
};
