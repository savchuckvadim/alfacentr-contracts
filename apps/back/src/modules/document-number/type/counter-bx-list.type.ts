export interface ICounterGetBxList {
    IBLOCK_TYPE_ID: 'lists';
    NAME: string; //rus prefix
    PROPERTY_190: number | { [key: string]: string }; //counter
    PROPERTY_188: string | { [key: string]: string };
    IBLOCK_ID: 46;
    CREATED_BY: number;
}

export interface ICounterAddBxList {
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
