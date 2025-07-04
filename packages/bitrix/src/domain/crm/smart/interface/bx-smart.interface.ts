import { IBXItem } from "@bitrix/index";

export interface IBXSmart<id extends string> extends IBXItem {
    entityTypeId: `${id}`
}
