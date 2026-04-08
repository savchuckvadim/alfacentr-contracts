'use client';

import {
    DocumentInvoiceShortRq,
    DocumentRqsPreview,
    DocumentUpdShortRq,
    useDocumentRq,
} from '@/modules/features/document-rq';
import { useDocumentParagraph } from '@/modules/features/document-paragraph';
import { ComponentPreloader, SimpleCard } from '@/modules/shared';
import { Dot } from 'lucide-react';
import { useBXRQ } from '@workspace/bx-rq';

export const ContractPreview = () => {
    const { isLoading } = useBXRQ()

    const { header } = useDocumentRq();

    const { totalSum, paragraphItems } = useDocumentParagraph();
    const paragraphTitle =
        paragraphItems.length > 1
            ? 'Пункты 1.1.2 Консультационных семинарах : \n '
            : 'Пункт 1.1.2 Консультационном семинаре : \n  ';

    if (isLoading) {
        return <div className="flex justify-center items-center h-full">
            <ComponentPreloader text="Загрузка..." />
        </div>
    }
    return (
        <div className="flex flex-col gap-4">
            <SimpleCard withCollapse={true} title="Шапка договора">
                <p>{header}</p>
            </SimpleCard>

            {paragraphItems && paragraphItems.length > 0 && (
                <SimpleCard withCollapse={true} title="Пункт 1.1.2">
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
                </SimpleCard>
            )}
            <SimpleCard withCollapse={true} title="Общая стоимость услуг">
                <p>{totalSum}</p>
            </SimpleCard>

            <SimpleCard
                withCollapse={true}
                title="Сокращенные реквизиты для Счета"
            >
                <DocumentInvoiceShortRq />
            </SimpleCard>

            <SimpleCard
                withCollapse={true}
                title="Сокращенные реквизиты для УПД"
            >
                <DocumentUpdShortRq />
            </SimpleCard>

            <SimpleCard withCollapse={true} title="Реквизиты">
                <DocumentRqsPreview />
            </SimpleCard>
        </div>
    );
};
