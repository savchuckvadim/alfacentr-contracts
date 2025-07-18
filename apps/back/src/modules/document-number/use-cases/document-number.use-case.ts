import { PBXService } from "@/modules/pbx/pbx.servise";
import { Injectable } from "@nestjs/common";
import { DocumentNumberDto } from "../dto/document-number.dto";
import { BxProductRowService } from "@/modules/alfa-products";


@Injectable()
export class DocumentNumberUseCase {
    constructor(
        private readonly pbxService: PBXService
    ) { }

    async execute(dto: DocumentNumberDto) {
        const { bitrix } = await this.pbxService.init('alfacentr.bitrix24.ru')
   
        const bxProductRowService = new BxProductRowService(bitrix)
        const rowsWithProducts = await bxProductRowService.getDealProductRowsWithProducts(dto.dealId.toString())
        console.log('✅ rowsWithProducts ', rowsWithProducts)
        return rowsWithProducts
    }
}   