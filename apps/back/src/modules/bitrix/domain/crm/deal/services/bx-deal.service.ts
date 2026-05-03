import { BxDealRepository } from '../repository/bx-deal.repository';
import { BitrixBaseApi } from 'src/modules/bitrix/core/base/bitrix-base-api';
import { IBXDeal } from '../interface/bx-deal.interface';

export class BxDealService {
    clone(api: BitrixBaseApi): BxDealService {
        const instance = new BxDealService();
        instance.init(api);
        return instance;
    }

    private repo: BxDealRepository;

    init(api: BitrixBaseApi) {
        this.repo = new BxDealRepository(api);
    }

    async get(dealId: number, select?: string[]) {
        return await this.repo.get(dealId, select);
    }
    async getList(
        filter: Partial<IBXDeal>,
        select?: string[],
        order?: { [key in keyof IBXDeal]?: 'asc' | 'desc' | 'ASC' | 'DESC' },
    ) {
        return await this.repo.getList(filter, select, order);
    }
    async set(data: Partial<IBXDeal>) {
        return await this.repo.set(data);
    }
    async update(dealId: number | string, data: Partial<IBXDeal>) {
        return await this.repo.update(dealId, data);
    }
    async getFieldsList(filter: { [key: string]: any }, select?: string[]) {
        return await this.repo.getFieldList(filter, select);
    }
    async getField(id: number | string) {
        return await this.repo.getField(id);
    }
    async contactItemsSet(
        dealId: number | string,
        contactIds: number[] | string[],
    ) {
        return await this.repo.contactItemsSet(dealId, contactIds);
    }
    async contactItemsGet(dealId: number | string) {
        return await this.repo.contactItemsGet(dealId);
    }
}
