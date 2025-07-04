import { EBxMethod } from "@bitrix/core";
import { CrmItemAddRequestType, CrmItemGetRequestType, CrmItemListRequestType, CrmUpdateItemRequestType } from "../../type/crm-request.type";

import { IBXItem } from "../interface/item.interface";
import { BxItemListResponseDto, BxItemResponseDto } from "../dto/item-response.dto";


export type BxItemSchema = {


    [EBxMethod.UPDATE]: {
        request: CrmUpdateItemRequestType<IBXItem>;
        response: boolean;
    };

    [EBxMethod.LIST]: {
        request: CrmItemListRequestType<IBXItem['entityTypeId']>;
        response: BxItemListResponseDto;
    };

    [EBxMethod.GET]: {
        request: CrmItemGetRequestType<string | number>;
        response: BxItemResponseDto;
    };

    [EBxMethod.ADD]: {
        request: CrmItemAddRequestType<IBXItem, string>;
        response: BxItemResponseDto;
    };
};
