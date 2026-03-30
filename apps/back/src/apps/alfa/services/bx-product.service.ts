import { BitrixService, IBXProduct } from '@/modules/bitrix';
import { DealValue } from './deal-helper/deal-values-helper.service';
import { BxDealDataKeys } from '../bx-data/bx-data';
import { BxParticipantsDataKeys } from '../bx-data/bx-participants-data';
import { bxProductData } from '../bx-data/bx-product-data';

export class BxProductService {
    constructor(private readonly bitrix: BitrixService) {}
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
                    const response = await this.bitrix.product.getList(
                        {
                            '=active': 'Y',
                            iblockId: 24,
                            '%name': prefix,
                            [`=${bxProductData.SEMINAR_TOPIC.bitrixId}`]:
                                value.value as string,
                            // [`=${bxProductData.PREFIX.bitrixId}`]: (prefix as string)
                            // 'property172': prefix
                        },
                        [
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
                            bxProductData.SEMINAR_TOPIC.bitrixId,
                        ],
                    );
                    response.result.products.map((product) => {
                        productsWithoutPrefix.push(product);

                        if (
                            product.property172 &&
                            typeof product.property172 === 'object' &&
                            !Array.isArray(product.property172) &&
                            'value' in product.property172 &&
                            product.property172.value === prefix
                        ) {
                            products.push(product);
                        }
                    });
                }
            }
        }

        return products;
    }
}
