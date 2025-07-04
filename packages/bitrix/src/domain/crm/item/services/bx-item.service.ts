
import { BitrixBaseApi } from "@bitrix/core";
import { BxItemRepository } from "../repository/bx-item.repository";
import { IBXItem } from "../interface/item.interface";
import { BitrixOwnerTypeId } from "../../../enums/bitrix-constants.enum";
import { BxItemListResponseDto, BxItemResponseDto } from "../dto/item-response.dto";


export class BxItemService {
    private repo!: BxItemRepository

    clone(api: BitrixBaseApi): BxItemService {
        const instance = new BxItemService();
        instance.init(api);
        return instance;
    }


    init(api: BitrixBaseApi) {
        this.repo = new BxItemRepository(api);
    }


    update(id: number | string, entityTypeId: BitrixOwnerTypeId.DEAL, data: Partial<IBXItem>) {
        return this.repo.update(id, entityTypeId, data);
    }

    async list(entityTypeId: string, filter?: Partial<IBXItem>, select?: string[]): Promise<BxItemListResponseDto    | null> {
        return (await this.repo.list(entityTypeId, filter, select))?.result as  BxItemListResponseDto | null;
    }

    async get(id: number | string, entityTypeId: string, select?: string[]): Promise<BxItemResponseDto | null> {
        return (await this.repo.get(id, entityTypeId, select))?.result as BxItemResponseDto | null;
    }

    async add(entityTypeId: string, data: Partial<IBXItem>): Promise<BxItemResponseDto | null> {
        return (await this.repo.add(entityTypeId, data))?.result as BxItemResponseDto | null;
    }

}