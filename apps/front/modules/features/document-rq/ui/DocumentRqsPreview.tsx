import { RQ_TYPE } from '@workspace/bx-rq';
import { useDocumentRq } from '../hooks/use-document-rq.hook';
import {
    DocumentFizRqAgent,
    DocumentOrganizationRqAgent,
    DocumentRqAgent,
} from '../model/slice/DocumentRqSlice';
import { getForDocumentItems } from '../utils/document-rq.util';

export const DocumentRqsPreview = () => {
    const { client, provider } = useDocumentRq();

    if (!client || !provider) {
        return null;
    }

    return (
        <div className="flex flex-row justify-between gap-4">
            <div className="w-1/2">
                <h2>Организация</h2>
                {provider.map((item, index) => {
                    return <p key={index}>{item}</p>;
                })}
            </div>
            <div className="w-1/2">
                <h2>Клиент</h2>
                {client.map((item, index) => {
                    return <p key={index}>{item}</p>;
                })}
            </div>
        </div>
    );
};
