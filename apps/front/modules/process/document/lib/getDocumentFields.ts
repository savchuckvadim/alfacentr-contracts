import { RootState } from '@/modules/app/model/store';

export const getDocumentFields = (state: RootState) => {
    const { client, general, provider, clientShortRq } = state.documentRq;
    const header = general.header;
    return {
        client,
        header,
        provider,
        clientShortRq
    };
};
