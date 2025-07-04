import { Controller, Get, Param, Query } from "@nestjs/common";
import { AlfaDealProductsUseCase } from "../use-case/alfa-deal-products.use-case";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

@ApiTags('Alfa Deal Products')
@Controller('alfa-deal-products')
export class AlfaDealProductsController {
    constructor(
        private readonly alfaDealProductsUseCase: AlfaDealProductsUseCase
    ) { }

    @ApiOperation({ summary: 'Get deal product rows with products' })
    @ApiParam({ name: 'domain', description: 'Domain' })
    @ApiParam({ name: 'dealId', description: 'Deal ID' })
    @Get(':domain/:dealId')
    async getDealProductRowsWithProducts(@Param('domain') domain: string, @Param('dealId') dealId: string) {
        return await this.alfaDealProductsUseCase.getDealProductRowsWithProducts(domain, dealId)
    }
}
