import { BitrixService, IBXProduct } from "@/modules/bitrix";
import { ListProductRowDto } from "@/modules/bitrix/domain/crm/product-row/dto/list-product-row.sto";
import { bxProductData } from "@alfa/entities";
import { BitrixOwnerType } from "@/modules/bitrix/domain/enums/bitrix-constants.enum";
import { IBitrixBatchResponseResult } from "@/modules/bitrix/core/interface/bitrix-api.intterface";
import { IBXProductRowRow } from "@/modules/bitrix/domain/crm/product-row/interface/bx-product-row.interface";

export interface BxProductRowWithProduct extends IBXProductRowRow {
    ownerType: BitrixOwnerType;
    ownerId: string | number;
    id?: number;
    ownerTypeId?: string | BitrixOwnerType;
    price?: number;
    productId?: number;
    measureCode?: number | string;
    measureId?: number | string;
    product: IBXProduct;
}

export class BxProductRowService {
    constructor(
        private readonly bitrix: BitrixService
    ) { }

    public async getDealProductRowsWithProducts(dealId: string) {
        const productRows = await this.getDealProductRows(dealId)
        productRows.map(async (row, index) => {
            this.getProductBatch(row.productId as number, row.id?.toString() || index.toString())


        })
        const response = await this.bitrix.api.callBatchWithConcurrency(2)
        const rowsWithProducts = this.prepareRowToRowWithProduct(productRows, response)
        return { rowsWithProducts, response }

    }
    private async getDealProductRows(dealId: string): Promise<IBXProductRowRow[]> {
        const getProductRowsData: ListProductRowDto = {
            "=ownerType": BitrixOwnerType.DEAL,
            "=ownerId": dealId

        }
        const response = await this.bitrix.productRow.list(getProductRowsData)
        return response.result.productRows
    }



    private getProductBatch(productId: number, batchKey: string): void {

        const select = [
            "iblockId",
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
            bxProductData.SEMINAR_TOPIC.bitrixId,
        ]

        const product = this.bitrix.batch.product.get(batchKey, productId, select)
    }
    private prepareRowToRowWithProduct(rows: IBXProductRowRow[], responses: IBitrixBatchResponseResult[]): BxProductRowWithProduct[] {
        const result: BxProductRowWithProduct[] = []
        rows.map((row, index) => {
            let product: IBXProduct | null = null
            responses.map(response => {
                const resultKey = row.id?.toString() || index.toString()
                product = response.result[resultKey].product as IBXProduct

            })
            if (product) {
                const resultRow = {
                    ...row,
                    product: product as IBXProduct
                } as BxProductRowWithProduct
                result.push(resultRow)
            }
        })
        return result
    }
}