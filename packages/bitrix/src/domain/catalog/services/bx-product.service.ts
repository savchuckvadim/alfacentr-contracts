import { BitrixBaseApi } from "@bitrix/core/base/bitrix-base-api";
import { BxProductRepository } from "../repository/bx-product.repository";
import { IBXProduct } from "../interface/bx-product.interface";


export class BxProductService {
    private repo!: BxProductRepository

    clone(api: BitrixBaseApi): BxProductService {
        const instance = new BxProductService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxProductRepository(api);
    }
    async get(id: number | string, select?: Partial<IBXProduct>): Promise<IBXProduct | null> {
        return (await this.repo.get(id, select)).result.product;
    }

    async getList(filter: Partial<IBXProduct>, select: (keyof IBXProduct)[]): Promise<IBXProduct[] | null> {
        return (await this.repo.getList(filter, select)).result.products;
    }
}