import { Injectable } from "@nestjs/common";
import { PBXService } from "@/modules/pbx";
import { BxSmartService } from "../services/bx-smart.service";
import { AddSmartItemDto} from "../dto/smart-item.dto";
import { CategoryIdEnum, IAlfaParticipantSmartItem, SmartEntity, SmartStageEnum } from "@alfa/entities";


@Injectable()
export class SmartUseCase {
    constructor(
        private readonly pbx: PBXService
    ) { }

    public async getList(entityTypeId: string, domain: string) {
        const { bitrix } = await this.pbx.init(domain)
        const smartsService = new BxSmartService()
        await smartsService.init(bitrix)
        const smarts = await smartsService.getList(entityTypeId);
        return smarts;
    }

    public async add(body: AddSmartItemDto, domain: string, categoryId: CategoryIdEnum, stageId: SmartStageEnum) {
        const { bitrix } = await this.pbx.init(domain)
        const smartsService = new BxSmartService()
        await smartsService.init(bitrix)
        const item = {
            ...body.item,
            stageId: `DT${body.entityTypeId}_${categoryId}:${stageId}` as SmartStageEnum
        } as IAlfaParticipantSmartItem;
        const smart = new SmartEntity(item)
        console.log(smart);
        const smarts = await smartsService.add(body.entityTypeId, item);
        return smarts;
    }
}