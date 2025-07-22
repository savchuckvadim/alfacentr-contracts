import { Injectable } from '@nestjs/common';
import { BxListRepository } from '../repository/bx-list.repository';
import { BitrixBaseApi } from 'src/modules/bitrix/core/base/bitrix-base-api';
import { EBxListCode } from '../interface/bx-list.interface';

@Injectable()
export class BxListService {
    clone(api: BitrixBaseApi): BxListService {
        const instance = new BxListService();
        instance.init(api);
        return instance;
    }

    private repo: BxListRepository;

    init(api: BitrixBaseApi) {
        this.repo = new BxListRepository(api);
    }

    async getList(IBLOCK_CODE?: EBxListCode, IBLOCK_ID?: number) {
        return await this.repo.getList(IBLOCK_CODE, IBLOCK_ID);
    }

    async getListField(code: EBxListCode, ID: string | number) {
        return await this.repo.getListField(code, ID);
    }

    async getListFields(code: EBxListCode) {
        return await this.repo.getListFields(code);
    }
}
