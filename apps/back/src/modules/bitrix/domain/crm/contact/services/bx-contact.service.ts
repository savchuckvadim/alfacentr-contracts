import { BxContactRepository } from '../repository/bx-contact.repository';
import { BitrixBaseApi } from 'src/modules/bitrix/core/base/bitrix-base-api';
import { IBXContact } from '../interface/bx-contact.interface';

export class BxContactService {
    private repo: BxContactRepository;

    clone(api: BitrixBaseApi): BxContactService {
        const instance = new BxContactService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxContactRepository(api);
    }

    async get(contactId: number) {
        return await this.repo.get(contactId);
    }

    async getList(filter: Partial<IBXContact>, select?: string[]) {
        return await this.repo.getList(filter, select);
    }

    async set(data: Partial<IBXContact>) {
        return await this.repo.set(data);
    }

    async update(contactId: number | string, data: Partial<IBXContact>) {
        return await this.repo.update(contactId, data);
    }

    async getFieldsList(filter: { [key: string]: any }, select?: string[]) {
        return await this.repo.getFieldList(filter, select);
    }

    async getField(id: number | string) {
        return await this.repo.getField(id);
    }
}
