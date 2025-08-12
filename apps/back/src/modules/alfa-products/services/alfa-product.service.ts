import {
    BitrixService,
    IBXProduct,
    IBXProductRow,
    IBXProductRowRow,
} from '@/modules/bitrix';
import { DealValue } from '../../on-deal-init/services/deal-helper/deal-values-helper.service';
import { BxDealDataKeys } from '@alfa/entities';
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
    constructor(private readonly bitrix: BitrixService) {}
    async addPpkProducts(dealId: number, dealValues: DealValue[]) {
        const products: IBXProduct[] = [];
        const productsWithoutPrefix: IBXProduct[] = [];
        const prefix = dealValues.find(
            (value) => value.code === BxDealDataKeys.prefix,
        )?.value as string;
        console.log('prefix', prefix);
        for (const value of dealValues) {
            if (
                value.code === BxParticipantsDataKeys.accountant_gos ||
                value.code === BxParticipantsDataKeys.accountant_medical ||
                value.code === BxParticipantsDataKeys.zakupki ||
                value.code === BxParticipantsDataKeys.kadry ||
                value.code === BxParticipantsDataKeys.corruption
            ) {
                // console.log('value', value);
                // console.log('value.value', value.value);
                // console.log('prefix', prefix);
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
                    console.log('filter', filter);
                    const response = await this.bitrix.product.getList(
                        filter,
                        select,
                    );
                    response.result.products.map((product) => {
                        productsWithoutPrefix.push(product);

                        // if (
                        //     product.property172 &&
                        //     typeof product.property172 === 'object' &&
                        //     !Array.isArray(product.property172) &&
                        //     'value' in product.property172 &&
                        //     product.property172.value === prefix
                        // ) {
                        products.push(product);
                        // }
                    });
                }
            } else if (value.code === BxParticipantsDataKeys.days) {
                console.log('value', value);
                console.log('value.value', value.value);
                console.log('prefix', prefix);
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
                        console.log('filter', filter);

                        const response = await this.bitrix.product.getList(
                            filter,
                            select,
                        );
                        await delay(1000);
                        response.result.products.map((product) => {
                            productsWithoutPrefix.push(product);

                            // if (
                            //     product.property172 &&
                            //     typeof product.property172 === 'object' &&
                            //     !Array.isArray(product.property172) &&
                            //     'value' in product.property172 &&
                            //     product.property172.value === prefix
                            // ) {
                            products.push(product);
                            // }
                        });
                    }
                }
            }
        }
        // if (products.length > 0) {
        //     console.log('products')
        //     for (const product of products) {
        //         console.log('name', product.name)
        //         console.log('property172', product.property172)
        //         console.log('property174', product.property174)
        //         console.log('property158', product.property158)
        //         console.log('property168', product.property168)
        //         console.log('property154', product.property154)
        //         console.log('property155', product.property155)
        //         console.log('property156', product.property156)
        //         console.log('property164', product.property164)
        //     }
        // }
        if (productsWithoutPrefix.length > 0) {
            // console.log('productsWithoutPrefix')
            // for (const product of productsWithoutPrefix) {
            //     console.log('productsWithoutPrefix', product.name)
            // }
        }
        console.log('prefix', prefix);
        if (products.length > 0) {
            await this.setProductsInDeal(dealId, products);
        }
        return products;
    }

    private async setProductsInDeal(dealId: number, products: IBXProduct[]) {
        const getProductRowsData: ListProductRowDto = {
            '=ownerType': BitrixOwnerType.DEAL,
            '=ownerId': dealId,
        };
        const responseGetProductRows =
            await this.bitrix.productRow.list(getProductRowsData);
        const currentProductRows = responseGetProductRows.result.productRows;
        console.log('responseGetProductRows', responseGetProductRows);

        // const productsWithPrice = await this.getProductPrice(products);

        // ✅ Сначала группируем по id с quantity
        const groupedProducts = this.groupProductsById(products); // возвращает IBXProduct & { quantity }

        // ✅ Передаём уже сгруппированные продукты в getProductPrice
        const productsWithPrice = await this.getProductPrice(groupedProducts);

        const newProductRows = productsWithPrice.map((product, index) => {
            console.log('product', product.name.toUpperCase());
            console.log('product', product.name.toUpperCase());
            console.log('product', product.name.toUpperCase());
            console.log('product', product.name.toUpperCase());
            console.log(product);
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
                sort: (index + 1) * 10 + currentProductRows.length * 10,
            } as IBXProductRowRow;
        });
        const uniqueProductRows = newProductRows.filter(
            (row, index, array) =>
                array.findIndex((r) => r.productId === row.productId) === index,
        );
        const productRows = [...currentProductRows, ...uniqueProductRows];
        console.log('productRows', productRows);

        const data: IBXProductRow = {
            ownerType: BitrixOwnerType.DEAL,
            ownerId: dealId,
            productRows,
        };
        const response = await this.bitrix.productRow.set(data);
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
