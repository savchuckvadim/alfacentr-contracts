import { Bitrix, BitrixOwnerTypeId, IBXProduct, IBXProductRowRow } from "@bitrix/index";
import { bxProductData } from "@alfa/entities";
import { BitrixService } from "@workspace/bitrix";
import { BitrixOwnerType } from "@workspace/bitrix/";
import { ListProductRowDto } from "@bitrix/domain/crm/product-row/dto/list-product-row.dto";
import { BxProductRowWithProduct } from "../model/ProductSlice";
import { IBitrixBatchResponseResult } from "@bitrix/core/interface/bitrix-api.intterface";



export interface AlfaProduct extends IBXProductRowRow {

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

export class AlfaBxProductService {
    bitrix!: BitrixService
    public constructor(

    ) {
        this.bitrix = Bitrix.getService()
    }

    public async getDealProductRowsWithProducts(dealId: string) {
        const productRows = await this.getDealProductRows(dealId)
        productRows.map(async (row, index) => {
            this.getProductBatch(row.productId as number, row.id?.toString() || index.toString())


        })
        const response = await this.bitrix.api.callBatch()
        const rows = this.prepareRowToRowWithProduct(productRows, [response])
        return { rows}

    }
    private async getDealProductRows(dealId: string): Promise<IBXProductRowRow[]> {
        const getProductRowsData: ListProductRowDto = {
            "=ownerType": BitrixOwnerTypeId.DEAL as unknown as string,
            "=ownerId": dealId

        }
        const response = await this.bitrix.productRow.list(getProductRowsData)
        return response.productRows
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
            bxProductData.SEMINAR_TOPIC.bitrixId.toString(),
        ]

     this.bitrix.batch.product.get(batchKey, productId, select)
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