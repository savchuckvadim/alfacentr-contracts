import { Injectable } from '@nestjs/common';
import {
    GetCategoryListDto,
    GetCategoryWithStagesDto,
    GetStagesDto,
} from './dto/get-category.dto';
import { BitrixService } from 'src/modules/bitrix/bitrix.service';

import { PortalModel } from 'src/modules/portal/services/portal.model';
import { PBXService } from '@/modules/pbx';

@Injectable()
export class CategoryService {
    private Portal: PortalModel;
    private bitrix: BitrixService;
    constructor(
        // private readonly bitrix: BitrixService,
        // private readonly portalService: PortalService,
        private readonly pbx: PBXService,
    ) {}
    async init(domain: string) {
        const { bitrix, PortalModel } = await this.pbx.init(domain);
        this.bitrix = bitrix;
        this.Portal = PortalModel;
    }

    async get(dto: GetCategoryWithStagesDto) {
        await this.init(dto.domain);
        const categoryResponse = await this.bitrix.category.get(
            dto.categoryId,
            dto.entityTypeId,
        );
        const category = categoryResponse.result.category;
        const stages = await this.bitrix.status.getList({
            CATEGORY_ID: dto.categoryId,
            ENTITY_ID: `DEAL_STAGE_${dto.categoryId}`,
        });

        return {
            category,
            stages: stages.result,
        };
    }
    async findAll(dto: GetCategoryListDto) {
        await this.init(dto.domain);
        return await this.bitrix.category.getList(dto.entityTypeId);
    }

    async findStages(dto: GetStagesDto) {
        await this.init(dto.domain);
        return this.bitrix.status.getList({ CATEGORY_ID: dto.categoryId });
    }

    async getPortalSmart(domain: string) {
        await this.init(domain);
        return this.Portal.getPortal().smarts;
    }
}
