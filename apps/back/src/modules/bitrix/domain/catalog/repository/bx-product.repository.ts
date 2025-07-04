import { EBXEntity, EBxMethod, EBxNamespace } from "@/modules/bitrix/core";
import { BitrixBaseApi } from "@/modules/bitrix/core/base/bitrix-base-api";
import { IBXProduct } from "../interface/bx-product.interface";


export class BxProductRepository {
    constructor(
        private readonly bxApi: BitrixBaseApi
    ) { }
    async get(id: number | string,select?: string[]) {
        return await this.bxApi.callType(
            EBxNamespace.CATALOG,
            EBXEntity.PRODUCT,
            EBxMethod.GET,
            { id, select }
        );
    }
    async getBatch(cmdCode: string, id: number | string, select?: string[]) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.CATALOG,
            EBXEntity.PRODUCT,
            EBxMethod.GET,
            { id, select }
        );
    }

    async getList(filter: Partial<IBXProduct>, select?: string[]) {
        return await this.bxApi.callType(
            EBxNamespace.CATALOG,
            EBXEntity.PRODUCT,
            EBxMethod.LIST,
            { filter, select, start: -1 }
        );
    }

    async getListBatch(cmdCode: string, filter: Partial<IBXProduct>, select?: string[]) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.CATALOG,
            EBXEntity.PRODUCT,
            EBxMethod.LIST,
            { filter, select, start: -1 }
        );
    }
}