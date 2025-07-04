import { EBxMethod } from "@bitrix/core";
import { IBXUserEnumerationField } from "../../interfaces/bitrix.interface";



export type FieldsEnumerationSchema = {

    [EBxMethod.FIELDS]: {
        request: undefined;
        response: { fields: IBXUserEnumerationField[] };
    };


};
