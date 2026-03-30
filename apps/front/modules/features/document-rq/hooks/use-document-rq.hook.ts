import { useAppSelector } from '@/modules/app';
import { useApp } from '@/modules/app/lib/hooks/app';
import { getForDocumentItems } from '../utils/document-rq.util';
import { DocumentRqAgent } from '../model/slice/DocumentRqSlice';
import { RQ_TYPE } from '@workspace/bx-rq';

export const useDocumentRq = () => {
    const { isClient } = useApp();
    const rqs = useAppSelector(state => state.documentRq);
    const { client, provider } = getForDocumentItems(
        rqs.client as DocumentRqAgent<RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION>,
        rqs.client?.type as RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION,
        rqs.provider as DocumentRqAgent<RQ_TYPE.ORGANIZATION>,
    );


    return {
        client: client,
        header: rqs.general.header,
        provider: provider,
        isClient,
        clientShortRq: rqs.clientShortRq,
        clientUpdShortRq: rqs.clientUpdShortRq,
        clientUpdAddress: rqs.clientUpdAddress,
    };
};
