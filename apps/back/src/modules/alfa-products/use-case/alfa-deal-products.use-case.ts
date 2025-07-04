import { Injectable } from "@nestjs/common";
import { BxProductRowService } from "../services/bx-product-row.service";
import { PBXService } from "@/modules/pbx";

@Injectable()
export class AlfaDealProductsUseCase {
    constructor(
        private readonly pbx: PBXService
    ) { }

    async getDealProductRowsWithProducts(domain: string, dealId: string) {
        const { bitrix } = await this.pbx.init(domain);
        const service = new BxProductRowService(bitrix);
        return await service.getDealProductRowsWithProducts(dealId)
    }
}