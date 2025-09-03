import { Injectable } from '@nestjs/common';
import { BxCompanyRepository } from '../repository/bx-company.repository';
import { BitrixBaseApi } from 'src/modules/bitrix/core/base/bitrix-base-api';
import { IBXCompany } from '../interface/bx-company.interface';
import { IBXField } from '../../fields/bx-field.interface';

export class BxCompanyService {
    private repo: BxCompanyRepository;

    clone(api: BitrixBaseApi): BxCompanyService {
        const instance = new BxCompanyService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxCompanyRepository(api);
    }

    async get(companyId: number) {
        return await this.repo.get(companyId);
    }

    async getList(filter: Partial<IBXCompany>, select?: string[], order?: { [key: string]: 'asc' | 'desc' | 'ASC' | 'DESC' }) {
        return await this.repo.getList(filter, select, order);
    }

    async set(data: Partial<IBXCompany>) {
        return await this.repo.set(data);
    }

    async update(companyId: number | string, data: Partial<IBXCompany>) {
        return await this.repo.update(companyId, data);
    }

    async getFieldsList(filter: { [key: string]: any }, select?: string[]) {
        return await this.repo.getFieldList(filter, select);
    }

    async getField(id: number | string) {
        return await this.repo.getField(id);
    }
    async addField(fields: Partial<IBXField>) {
        return await this.repo.setField(fields);
    }
}
