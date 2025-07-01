
import {
    Result,
    EnumCrmEntityTypeId,
} from '@bitrix24/b24jssdk'
import { initializeB24Frame } from '@bitrix24/b24jssdk'


type B24 = Awaited<ReturnType<typeof initializeB24Frame>>;

export class BxService {
    private b24: B24;

    private constructor(b24Instance: B24) {
        this.b24 = b24Instance;
    }

    static async create(): Promise<BxService> {
        const b24 = await initializeB24Frame();
        return new BxService(b24);
    }

    public getB24(): B24 {
        return this.b24;
    }
}

// Синглтон — объект класса BxService
let bxSingleton: BxService | null = null;

// Экспортируемый метод для получения оригинального b24
export async function getBxService(): Promise<B24> {
    if (!bxSingleton) {
        bxSingleton = await BxService.create();
    }
    return bxSingleton.getB24();
}

export interface IBatchRequest {
    [key: string]: {
        method: string
        params: any
    }
}

export const bxBatchAPI = {


    callBatch: async (batch: IBatchRequest) => {
        const b24 = await getBxService();

        const placement = b24.placement
        console.log('b24test plcmnt')
        console.log(placement)
        const authData = b24.auth.getAuthData()



        try {
            const result = await b24.callBatch(batch) as Result
            console.log('b24 batch test result')
            console.log(result)

            console.log('b24 batch test result')


            return result

        } catch (error) {
            console.log('b24test error')
            console.log(error)
        }

    },




}