import {
    API_METHOD,
    backAPI,
    EBACK_ENDPOINT,
    EResultCode,
} from '@workspace/api';
import { EContractType, IRequestDocumentGenerateType } from '@alfa/entities';
import { registerWSHandler } from '@/modules/shared/Websocket/ws-handlers-registry';
import { documentGenerateDone } from '../../model/thunk/DocumentThunk';

export class DocumentGenerateOwnService {
    constructor() { }

    async push(dto: IRequestDocumentGenerateType) {
        const response = await backAPI.service(
            EBACK_ENDPOINT.DOCUMENT_GENERATE,
            API_METHOD.POST,
            dto,
        );
        if (response.resultCode !== EResultCode.SUCCESS) {
            throw new Error(
                response?.errors?.join(', ') ||
                response.message ||
                'Error generating document',
            );
        }
        return response.data;
    }

    /**
     * Проверяет на бэке, что все обязательные (по типу договора)
     * поля сделки с документами заполнены
     */
    async isDealReadyForSend(
        dealId: number,
        contractType?: EContractType,
    ): Promise<boolean> {
        const response = await backAPI.service<boolean>(
            EBACK_ENDPOINT.DOCUMENT_IS_DEAL_READY_FOR_SEND,
            API_METHOD.POST,
            { dealId, contractType },
        );
        if (response?.resultCode !== EResultCode.SUCCESS) {
            return false;
        }
        return response.data === true;
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
