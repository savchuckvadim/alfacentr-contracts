export interface IDocumentNumberUpdateDoneResponse {
    data: {
        prefix: string;
        counter: number;
        dealId: number;
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
