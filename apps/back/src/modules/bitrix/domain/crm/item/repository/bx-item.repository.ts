// import { BitrixBaseApi } from "src/modules/bitrix/core/base/bitrix-base-api";
import { BitrixBaseApi } from 'src/modules/bitrix/core/base/bitrix-base-api';
import {
    EBxMethod,
    EBxNamespace,
} from '../../../../core/domain/consts/bitrix-api.enum';
import { EBXEntity } from '../../../../core/domain/consts/bitrix-entities.enum';
import { IBXItem } from '../interface/item.interface';
import { BitrixOwnerTypeId } from '../../../enums/bitrix-constants.enum';

export class BxItemRepository {
    constructor(private readonly bxApi: BitrixBaseApi) {}

    async update(
        id: number | string,
        entityTypeId: BitrixOwnerTypeId.DEAL,
        data: Partial<IBXItem>,
    ) {
        return this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.UPDATE,
            { id: id, entityTypeId, fields: data },
        );
    }

    async updateBtch(
        cmdCode: string,
        id: number | string,
        entityTypeId: BitrixOwnerTypeId.DEAL,
        data: { [key: string]: any },
    ) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.UPDATE,
            { id: id, entityTypeId, fields: data },
        );
    }

    /**
     * crm.item.list отдает по 50 записей за вызов.
     * start — смещение страницы: без него обработается только первая
     */
    async list(
        entityTypeId: string,
        filter?: Partial<IBXItem>,
        select?: string[],
        start?: number,
    ) {
        return this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.LIST,
            { entityTypeId, filter, select, start },
        );
    }

    async get(id: number | string, entityTypeId: string, select?: string[]) {
        return this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.GET,
            { id, entityTypeId, select },
        );
    }

    async add(entityTypeId: string, data: Partial<IBXItem>) {
        return this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.ADD,
            { entityTypeId, fields: data },
        );
    }
}
