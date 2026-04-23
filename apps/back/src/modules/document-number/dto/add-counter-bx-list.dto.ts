import {
    ICounterAddBxList,
    ICounterGetBxList,
} from '../type/counter-bx-list.type';

export class CounterGetBxListDto implements ICounterGetBxList {
    IBLOCK_TYPE_ID: 'lists';
    ID: number;
    NAME: string;
    PROPERTY_190: { [key: string]: string };
    PROPERTY_188: { [key: string]: string };
    IBLOCK_ID: 46;
    CREATED_BY: number;
}

export class CounterAddBxListDto implements ICounterAddBxList {
    IBLOCK_TYPE_ID: 'lists';
    ELEMENT_CODE: string;
    IBLOCK_ID: 46;
    FIELDS: {
        CREATED_BY: number;
        NAME: string;
        PROPERTY_190: number;
        PROPERTY_188: string;
    };
}
