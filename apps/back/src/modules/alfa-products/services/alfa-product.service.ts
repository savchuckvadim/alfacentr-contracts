import {
    BitrixService,
    IBXProduct,
    IBXProductRow,
    IBXProductRowRow,
} from '@/modules/bitrix';
import { DealValue } from '../../../lib/deal-helper/deal-values-helper.service';
import { BxDealDataKeys, getProductTypeByProductName } from '@alfa/entities';
import { bxProductData } from '@alfa/entities';
import { BitrixOwnerType } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { BxParticipantsDataKeys, isPpkProgramCode } from '@alfa/entities';
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
/** Откуда пришло название, по которому искали товар */
export type ProductResolveIssueSource = 'days' | 'ppk';

/**
 * Проблема подбора товара по названию из заявки:
 * ничего не нашли или нашли несколько и не смогли выбрать
 */
export interface ProductResolveIssue {
    kind: 'not_found' | 'ambiguous';
    source: ProductResolveIssueSource;
    /** имя поля сделки, например «Участник 2 Дни участия» */
    fieldName: string;
    /** текст, по которому искали товар */
    query: string;
    candidates: { id: string | number; name: string; nameBid: string }[];
}

export interface AddProductsResult {
    products: IBXProduct[];
    issues: ProductResolveIssue[];
}

export class AlfaProductService {
    constructor(private readonly bitrix: BitrixService) {}

    async addPpkProducts(
        dealId: number,
        dealValues: DealValue[],
    ): Promise<AddProductsResult> {
        const products: IBXProduct[] = [];
        const issues: ProductResolveIssue[] = [];
        const prefix = dealValues.find(
            (value) => value.code === BxDealDataKeys.prefix,
        )?.value as string;

        for (const value of dealValues) {
            if (isPpkProgramCode(value.code)) {
                if (value.value) {
                    const query = value.value as string;
                    const filter = {
                        iblockId: 24,
                        '%name': prefix,
                        [`%${bxProductData.NAME_BID.bitrixId}`]: query,
                    };

                    const response = await this.bitrix.product.getList(
                        filter,
                        select,
                    );
                    const resolved = this.resolveSingleProduct(
                        response.result.products,
                        query,
                        value.name,
                        'ppk',
                    );
                    if (resolved.product) products.push(resolved.product);
                    if (resolved.issue) issues.push(resolved.issue);
                }
            } else if (value.code === BxParticipantsDataKeys.days) {
                if (
                    value.value &&
                    Array.isArray(value.value) &&
                    value.value.length > 0
                ) {
                    for (const item of value.value) {
                        const query = item as string;
                        const filter = {
                            iblockId: 24,
                            [`%${bxProductData.NAME_BID.bitrixId}`]: query,
                        };

                        const response = await this.bitrix.product.getList(
                            filter,
                            select,
                        );
                        await delay(1000);
                        const resolved = this.resolveSingleProduct(
                            response.result.products,
                            query,
                            value.name,
                            'days',
                        );
                        if (resolved.product) products.push(resolved.product);
                        if (resolved.issue) issues.push(resolved.issue);
                    }
                }
            }
        }

        if (products.length > 0) {
            const ordredBySeminarFurstProducts = products.sort((a, b) => {
                const isSeminarProductA =
                    getProductTypeByProductName(a.name) === 'seminar';

                return isSeminarProductA ? -1 : 1;
            });

            void (await this.setProductsInDeal(
                dealId,
                ordredBySeminarFurstProducts,
            ));
        }
        return { products, issues };
    }

    /**
     * Выбирает ровно один товар из найденных.
     *
     * Поиск идет через LIKE по «Названию в заявке» (%property402), потому что
     * значения элементов списков в битриксе обрезаются, а название товара полное.
     * Поэтому совпадений может быть несколько — раньше в сделку молча уходили все.
     */
    private resolveSingleProduct(
        found: IBXProduct[],
        query: string,
        fieldName: string,
        source: ProductResolveIssueSource,
    ): { product: IBXProduct | null; issue: ProductResolveIssue | null } {
        const candidates = found || [];

        if (!candidates.length) {
            return {
                product: null,
                issue: {
                    kind: 'not_found',
                    source,
                    fieldName,
                    query,
                    candidates: [],
                },
            };
        }

        if (candidates.length === 1) {
            return { product: candidates[0], issue: null };
        }

        //точное совпадение названия — берем без предупреждения
        const exact = candidates.filter(
            (product) => this.getProductNameBid(product) === query,
        );
        if (exact.length === 1) return { product: exact[0], issue: null };

        //название товара начинается с запроса — это обрезанное значение списка
        const byPrefix = candidates.filter((product) =>
            this.getProductNameBid(product).startsWith(query),
        );
        if (byPrefix.length === 1) return { product: byPrefix[0], issue: null };

        //разобрать не смогли: в сделку не вставляем, зовем человека
        return {
            product: null,
            issue: {
                kind: 'ambiguous',
                source,
                fieldName,
                query,
                candidates: candidates.map((product) => ({
                    id: product.id,
                    name: product.name,
                    nameBid: this.getProductNameBid(product),
                })),
            },
        };
    }

    private getProductNameBid(product: IBXProduct): string {
        const property = product[bxProductData.NAME_BID.bitrixId] as
            | { value?: string }
            | undefined;
        return String(property?.value ?? '');
    }

    private async setProductsInDeal(dealId: number, products: IBXProduct[]) {
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
        void (await this.bitrix.productRow.set(data));
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
            } else {
                console.log('not foundPrice', product.id);
            }
        }
        return products;
    }
}
