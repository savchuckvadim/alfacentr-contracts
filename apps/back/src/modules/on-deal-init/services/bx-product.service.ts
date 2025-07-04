import { BitrixService, IBXProduct, IBXProductRow, IBXProductRowRow } from "@/modules/bitrix";
import { DealValue } from "./deal-helper/deal-values-helper.service";
import { BxDealDataKeys } from "../bx-data/bx-data";
import { bxProductData } from "../bx-data/bx-product-data";
import { BitrixOwnerType } from "@/modules/bitrix/domain/enums/bitrix-constants.enum";
import { ListProductRowDto } from "@/modules/bitrix/domain/crm/product-row/dto/list-product-row.sto";
import { BxParticipantsDataKeys } from "@alfa/entities";


export class BxProductService {
    constructor(
        private readonly bitrix: BitrixService
    ) { }
    async addPpkProducts(dealId: number, dealValues: DealValue[]) {
        const products: IBXProduct[] = []
        const productsWithoutPrefix: IBXProduct[] = []
        const prefix = dealValues.find(value => value.code === BxDealDataKeys.prefix)?.value as string
        console.log('prefix', prefix)
        for (const value of dealValues) {
            if (value.code === BxParticipantsDataKeys.accountant_gos
                || value.code === BxParticipantsDataKeys.accountant_medical
                || value.code === BxParticipantsDataKeys.zakupki
                || value.code === BxParticipantsDataKeys.kadry
                || value.code === BxParticipantsDataKeys.corruption

            ) {
                if (value.value) {
                    const response = await this.bitrix.product.getList({
                        // "=active": "Y",
                        "iblockId": 24,
                        "%name": (prefix as string),
                        [`=${bxProductData.SEMINAR_TOPIC.bitrixId}`]: (value.value as string),
                        // [`=${bxProductData.PREFIX.bitrixId}`]: (prefix as string)
                        // 'property172': prefix

                    },
                        [
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
                    )
                    response.result.products.map(product => {
                        productsWithoutPrefix.push(product)

                        if (
                            product.property172 &&
                            typeof product.property172 === "object" &&
                            !Array.isArray(product.property172) &&
                            "value" in product.property172 &&
                            product.property172.value === prefix
                        ) {
                            products.push(product)
                        }
                    })

                }
            }
        }
        if (products.length > 0) {
            console.log('products')
            for (const product of products) {
                console.log('name', product.name)
                console.log('property172', product.property172)
                console.log('property174', product.property174)
                console.log('property158', product.property158)
                console.log('property168', product.property168)
                console.log('property154', product.property154)
                console.log('property155', product.property155)
                console.log('property156', product.property156)
                console.log('property164', product.property164)
            }
        }
        if (productsWithoutPrefix.length > 0) {
            // console.log('productsWithoutPrefix')
            // for (const product of productsWithoutPrefix) {
            //     console.log('productsWithoutPrefix', product.name)
            // }
        }
        console.log('prefix', prefix)
        if (products.length > 0) {
            await this.setProductsInDeal(dealId, products)
        }
        return products

    }

    private async setProductsInDeal(
        dealId: number,
        products: IBXProduct[]
    ) {
        const getProductRowsData: ListProductRowDto = {
            "=ownerType": BitrixOwnerType.DEAL,
            "=ownerId": dealId

        }
        const responseGetProductRows = await this.bitrix.productRow.list(getProductRowsData)
        const currentProductRows = responseGetProductRows.result.productRows
        console.log('responseGetProductRows', responseGetProductRows)

        const productsWithPrice = await this.getProductPrice(products)

        const newProductRows = productsWithPrice.map((product, index) => {
            console.log('product', product.name.toUpperCase())
            console.log('product', product.name.toUpperCase())
            console.log('product', product.name.toUpperCase())
            console.log('product', product.name.toUpperCase())
            console.log(product)
            return {
                // id: Number(product.id),
                quantity: productsWithPrice.filter(p => p.id === product.id).length,
                price: Number(product.price),

                productId: Number(product.id),
                productName: product.name,
                measureId: 10,
                measureCode: 792,
                measureName: "чел.",
                sort: ((index + 1) * 10) + (currentProductRows.length * 10)
            } as IBXProductRowRow
        })
        const uniqueProductRows = newProductRows.filter((row, index, array) => 
            array.findIndex(r => r.productId === row.productId) === index
        );
        const productRows = [...currentProductRows, ...uniqueProductRows]
        console.log('productRows', productRows)

        const data: IBXProductRow = {

            ownerType: BitrixOwnerType.DEAL,
            ownerId: dealId,
            productRows
        }
        const response = await this.bitrix.productRow.set(data)
        // console.log('response', response)
    }

    private async getProductPrice(products: IBXProduct[]) {

        for (const product of products) {

            const filter = {
                productId: product.id,
                priceTypeId: 1
            }
            const response = await this.bitrix.api.call('catalog.price.list', {
                filter,
                start: -1,
                // select: ['id', 'price', 'productId']

            })
            const foundPrice = response.result.prices.find(price => price.productId === product.id)
            if (foundPrice) {
                product.price = foundPrice.price
                console.log('foundPrice', foundPrice)
            } else {
                console.log('not foundPrice', product.id)
            }
            // console.log('response', response.result.prices[0])
        }
        return products
    }
}   