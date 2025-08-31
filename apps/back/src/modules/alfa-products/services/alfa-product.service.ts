import {
    BitrixService,
    IBXProduct,
    IBXProductRow,
    IBXProductRowRow,
} from '@/modules/bitrix';
import { DealValue } from '../../on-deal-init/services/deal-helper/deal-values-helper.service';
import { BxDealDataKeys, getProductTypeByProductName } from '@alfa/entities';
import { bxProductData } from '@alfa/entities';
import { BitrixOwnerType } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { ListProductRowDto } from '@/modules/bitrix/domain/crm/product-row/dto/list-product-row.sto';
import { BxParticipantsDataKeys } from '@alfa/entities';
import { delay } from '@/lib';

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
    'detailText',
    bxProductData.SEMINAR_TOPIC.bitrixId,
    bxProductData.NAME_BID.bitrixId,
];
export class AlfaProductService {
    constructor(private readonly bitrix: BitrixService) { }
    async addPpkProducts(dealId: number, dealValues: DealValue[]) {
        const products: IBXProduct[] = [];
        const productsWithoutPrefix: IBXProduct[] = [];
        const prefix = dealValues.find(
            (value) => value.code === BxDealDataKeys.prefix,
        )?.value as string;

        for (const value of dealValues) {
            if (
                value.code === BxParticipantsDataKeys.accountant_gos ||
                value.code === BxParticipantsDataKeys.accountant_medical ||
                value.code === BxParticipantsDataKeys.zakupki ||
                value.code === BxParticipantsDataKeys.kadry ||
                value.code === BxParticipantsDataKeys.corruption
            ) {

                if (value.value) {
                    const filter = {
                        // "=active": "Y",
                        iblockId: 24,
                        '%name': prefix as string,
                        // [`=${bxProductData.SEMINAR_TOPIC.bitrixId}`]:
                        //     value.value as string,
                        [`%${bxProductData.NAME_BID.bitrixId}`]:
                            value.value as string,
                        // '%detailText': value.value as string
                        // '%detailText': value.value as string
                        // [`=${bxProductData.PREFIX.bitrixId}`]: (prefix as string)
                        // 'property172': prefix
                    };

                    const response = await this.bitrix.product.getList(
                        filter,
                        select,
                    );
                    response.result.products.map((product) => {
                        productsWithoutPrefix.push(product);

                        products.push(product);

                    });
                }
            } else if (value.code === BxParticipantsDataKeys.days) {

                if (
                    value.value &&
                    Array.isArray(value.value) &&
                    value.value.length > 0
                ) {
                    for (const item of value.value) {
                        const filter = {
                            // "=active": "Y",
                            iblockId: 24,
                            // '%name': prefix as string,
                            // [`=${bxProductData.SEMINAR_TOPIC.bitrixId}`]:
                            //     value.value as string,
                            // '%detailText': item as string
                            [`%${bxProductData.NAME_BID.bitrixId}`]:
                                item as string,
                            // [`=${bxProductData.PREFIX.bitrixId}`]: (prefix as string)
                            // 'property172': prefix
                        };

                        const response = await this.bitrix.product.getList(
                            filter,
                            select,
                        );
                        await delay(1000);
                        response.result.products.map((product) => {
                            productsWithoutPrefix.push(product);

                            products.push(product);

                        });
                    }
                }
            }
        }



        if (products.length > 0) {
            const ordredBySeminarFurstProducts = products.sort((a, b) => {
                const isSeminarProductA = getProductTypeByProductName(a.name) === 'seminar';
        
                return isSeminarProductA ? -1 : 1;
            });



            void await this.setProductsInDeal(dealId, ordredBySeminarFurstProducts);
        }
        return products;
    }

    private async setProductsInDeal(dealId: number, products: IBXProduct[]) {
        // const getProductRowsData: ListProductRowDto = {
        //     '=ownerType': BitrixOwnerType.DEAL,
        //     '=ownerId': dealId,
        // };
        // const responseGetProductRows =
        //     await this.bitrix.productRow.list(getProductRowsData);
        // const currentProductRows = responseGetProductRows.result.productRows;
        // console.log('responseGetProductRows', responseGetProductRows);

        // const productsWithPrice = await this.getProductPrice(products);

        // ✅ Сначала группируем по id с quantity
        const groupedProducts = this.groupProductsById(products); // возвращает IBXProduct & { quantity }

        // ✅ Передаём уже сгруппированные продукты в getProductPrice
        const productsWithPrice = await this.getProductPrice(groupedProducts);

        const newProductRows = productsWithPrice.map((product, index) => {

            return {
                // id: Number(product.id),
                // quantity: productsWithPrice.filter((p) => p.id === product.id)
                //     .length,
                quantity: product.quantity,
                price: Number(product.price),

                productId: Number(product.id),
                productName: product.name,
                measureId: 10,
                measureCode: 792,
                measureName: 'чел.',
                sort: (index + 1) * 10,
            } as IBXProductRowRow;
        });
        const uniqueProductRows = newProductRows.filter(
            (row, index, array) =>
                array.findIndex((r) => r.productId === row.productId) === index,
        );
        const productRows = uniqueProductRows;


        const data: IBXProductRow = {
            ownerType: BitrixOwnerType.DEAL,
            ownerId: dealId,
            productRows,
        };
        void await this.bitrix.productRow.set(data);
        // console.log('response', response)
    }
    private groupProductsById(
        products: IBXProduct[],
    ): (IBXProduct & { quantity: number })[] {
        const productMap = new Map<number, IBXProduct & { quantity: number }>();

        for (const product of products) {
            const existing = productMap.get(Number(product.id));
            if (existing) {
                existing.quantity += 1;
            } else {
                productMap.set(Number(product.id), { ...product, quantity: 1 });
            }
        }

        return Array.from(productMap.values());
    }

    private async getProductPrice(products: IBXProduct[]) {
        for (const product of products) {
            const filter = {
                productId: product.id,
                priceTypeId: 1,
            };
            const response = await this.bitrix.api.call('catalog.price.list', {
                filter,
                start: -1,
                // select: ['id', 'price', 'productId']
            });
            const foundPrice = response.result.prices.find(
                (price) => price.productId === product.id,
            );
            if (foundPrice) {
                product.price = foundPrice.price;
                console.log('foundPrice', foundPrice);
            } else {
                console.log('not foundPrice', product.id);
            }
            // console.log('response', response.result.prices[0])
        }
        return products;
    }
}
