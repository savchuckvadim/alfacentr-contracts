
import { useDocumentRq } from '../hooks/use-document-rq.hook';


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
