import { EBxMethod } from "@bitrix/core";
import { IBXUserField } from "../../interfaces/bitrix.interface";



export type FieldsSchema = {

    [EBxMethod.FIELDS]: {
        request: undefined;
        response: { fields: IBXUserField[] };
    };
};
