import {  BitrixOwnerTypeId } from "../../../enums/bitrix-constants.enum";

export interface IBXTimelineItemPin {
    id: number,
    ownerTypeId: BitrixOwnerTypeId,
    ownerId: number,
}
