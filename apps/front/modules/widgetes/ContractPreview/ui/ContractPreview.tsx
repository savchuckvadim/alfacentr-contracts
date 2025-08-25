'use client';

import {
    DocumentRqsPreview,
    useDocumentRq,
} from '@/modules/features/document-rq';
import { useDocumentParagraph } from '@/modules/features/document-paragraph';
import { SimpleCard } from '@/modules/shared';
import { Dot } from 'lucide-react';

export const ContractPreview = () => {
    const { header } = useDocumentRq();

    console.log(header);
    const { paragraph, totalSum, paragraphItems } = useDocumentParagraph();
    const paragraphTitle =
        paragraphItems.length > 1
            ? 'Пункты 1.1.2 Консультационных семинарах : \n '
            : 'Пункт 1.1.2 Консультационном семинаре : \n  ';

    return (
        <div className="flex flex-col gap-4">
            <SimpleCard
                withCollapse={true}
                title="Шапка договора"
                children={<p>{header}</p>}
            />

            {paragraphItems && paragraphItems.length > 0 && (
                <SimpleCard
                    withCollapse={true}
                    title="Пункт 1.1.2"
                    children={
                        <div>
                            <p>{paragraphTitle}</p>
                            {paragraphItems.map((item, index) => (
                                <div
                                    key={`${index}-paragraph-item`}
                                    className="flex items-center gap-2 my-2"
                                >
                                    <Dot className="w-4 h-4 text-primary" />
                                    <p>{item}</p>
                                </div>
                            ))}
                        </div>
                    }
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
