'use client';
import { useDocumentRq } from '../hooks/use-document-rq.hook';
export const DocumentInvoiceShortRq = () => {
    const { clientShortRq } = useDocumentRq();

    return (
        <div>
            <p>{clientShortRq}</p>
        </div>
    );
};
