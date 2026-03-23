import { Controller, Get, Param } from '@nestjs/common';
import { AlfaDealProductsUseCase } from '../use-case/alfa-deal-products.use-case';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PBXService } from '@/modules/pbx';
import { bxProductData } from '@alfa/entities';
const select = [
    'iblockId',
    'active',
    'name',
    'price',
    'currencyId',

    'id',
    'property172',
    'property174',
    'property158',
    'property168',
    'property154',
    'property155',
    'property156',
    'property164',
    'property166',
    'property216',
    'property217',
    'property218',
    'property219',
    'property220',
    'property221',
    bxProductData.NAME_BID.bitrixId,
    bxProductData.DETAIL_TEXT.bitrixId,
    bxProductData.SEMINAR_TOPIC.bitrixId,
];

@ApiTags('Alfa BX Products')
@Controller('alfa-bx-products')
export class AlfaBxProductsController {
    constructor(
        private readonly alfaDealProductsUseCase: AlfaDealProductsUseCase,
        private readonly pbx: PBXService,
    ) {}

    @ApiOperation({ summary: 'Get  product by field' })
    @ApiParam({ name: 'detailText', description: 'Detail Text' })
    @Get('by-field/:detailText')
    async getProductByField(@Param('detailText') detailText: string) {
        const domain = 'alfacentr.bitrix24.ru';
        const { bitrix } = await this.pbx.init(domain);
        let txt =
            '26 сентября 2025 г. Волгина Ю.Н. "Заработная плата и отчетность в 2025 году. Расчеты с персоналом, НДФЛ, страховые взносы - решение сложных ситуаций в учреждении бюджетной сферы"';
        // txt = txt.replace(/[^0-9]/g, '');
        const filter = {
            // "=active": "Y",
            iblockId: 24,
            // '%name': prefix as string,
            [`%${bxProductData.NAME_BID.bitrixId}`]: detailText as string,
            // '%detailText': detailText as string
            // [`=${bxProductData.PREFIX.bitrixId}`]: (prefix as string)
            // 'property172': prefix
        };

        const response = await bitrix.product.getList(filter, select);
        const products = response.result.products;
        return {
            products,
            bxProductData: bxProductData.NAME_BID.bitrixId,
        };
    }

    @ApiOperation({ summary: 'Get deal product rows with products' })
    @ApiParam({ name: 'productId', description: 'productId' })
    @Get('by-id/:productId')
    async getDealProductRowsWithProductsById(
        @Param('productId') productId: string,
    ) {
        const domain = 'alfacentr.bitrix24.ru';
        const { bitrix } = await this.pbx.init(domain);
        const product = await bitrix.product.get(productId, select);
        if (product.result.product) {
            return product.result.product;
        }
        return null;
    }
}
