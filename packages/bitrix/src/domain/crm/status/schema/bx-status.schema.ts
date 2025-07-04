import { EBxMethod } from "@bitrix/core";
import { IBXStatus } from "../interface/bx-status.interface";
import { BitrixOwnerTypeId } from "@bitrix/domain/enums/bitrix-constants.enum";
import { CrmListRequestType } from "../../type/crm-request.type";


export type BxStatusSchema = {

    [EBxMethod.LIST]: {
        request: CrmListRequestType<IBXStatus>;
        response: IBXStatus[];
    };
};
