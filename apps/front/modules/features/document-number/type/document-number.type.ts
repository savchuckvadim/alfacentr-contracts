export interface IDocumentNumberUpdateDoneResponse {
    data: {
        prefix: string;
        /** null, если бэкенд не смог выдать номер — записывать его нельзя */
        counter: number | null;
        dealId: number;
        error?: boolean;
        message?: string;
    };
}
export interface IDocumentNumberUpdateDoneResult {
    prefix: string;
    counter: number;
}

export interface IDocumentNumberUpdateRequest {
    dealId: number;
    prefix: string;
    dinamycPrefix: string;
    socketId: string;
}
