'use client';
import { useDocumentRq } from '../hooks/use-document-rq.hook';
export const DocumentUpdShortRq = () => {
    const { clientUpdShortRq, clientUpdAddress } = useDocumentRq();
    const space = '________________________________________';
    return (
        <div>
            <p>{clientUpdShortRq || space}</p>
            <p>{clientUpdAddress || space}</p>
        </div>
    );
};
