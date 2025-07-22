import { API_METHOD, backAPI, EBACK_ENDPOINT } from '@workspace/api';
import { IRequestDocumentGenerateType } from '@alfa/entities';
import { WSClient } from '@workspace/ws';
import { registerWSHandler } from '@/modules/shared/Websocket/ws-handlers-registry';
import { documentGenerateDone } from '../../model/DocumentThunk';

export class DocumentGenerateOwnService {
    constructor() {}

    async push(dto: IRequestDocumentGenerateType) {
        const response = await backAPI.service(
            EBACK_ENDPOINT.DOCUMENT_GENERATE,
            API_METHOD.POST,
            dto,
        );
    }

    // async wsListener(socketId: string, wsClient: WSClient) {
    //     // const ws = getWSClient()
    //     wsClient.on('document-generate:done', (data: any) => {

    //         console.log(data)
    //     })
    // }

    async registerDocumentWSHandlers() {
        registerWSHandler('document-generate:done', (data, dispatch) => {
            dispatch(documentGenerateDone(data));
        });
    }
}
