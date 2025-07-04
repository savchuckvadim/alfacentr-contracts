
export enum CONTRACT_RQ_GROUP {
    RQ = "rq",
    BANK = "bank",
    ADDRESS = "address",
    CONTRACT = "contract",
    SPECIFICATION = "specification",
    SUPPLY = "supply",
}

// Общий тип для элементов, которые входят в массив items
export interface SelectItem {
    id: number;
    code: RQ_TYPE;
    name: string;
    title: string;
}

export interface ARQInput<T = string> {
    type: "string" | "text" | "date" | "select" | "file";
    name: string;
    isRequired: boolean;
    code: T;
    includes: Array<RQ_TYPE>;
    supplies?: Array<SupplyTypesType>;
    contractType?: Array<CONTRACT_LTYPE>;
    group: CONTRACT_RQ_GROUP;
    isActive: boolean;
    isDisable: boolean;
    order: number;
    component?: "base" | "contract" | "invoice" | "client";
    isHidden?: boolean; //скрытый
}
// Тип для объектов с type 'select'
export interface SelectInput<T = string> extends ARQInput<T> {
    type: "select";
    items: SelectItem[];
    value: SelectItem;
}
export interface FileInput extends ARQInput<string> {
    type: "file";
    file: File | undefined;
    value: string | BXCurrentFile | BXCurrentSmartFile;
}

export interface BXCurrentFile {
    id: number;
    downloadUrl: string
}

export interface BXCurrentSmartFile {
    id: number;
    url: string;
}

// Тип для объектов с type 'string'
export interface StringInput extends ARQInput<string> {
    type: "string" | "text" | "date";
    value: string;
}

export type DocumentInputValue = string | null;
// Объединение типов для массива rq
export type RqItem = SelectInput | StringInput | FileInput;

export enum RQ_TYPE {
    ORGANIZATION = "org",
    BUDGET = "org_state",
    IP = "ip",
    FIZ = "fiz",
}
export enum RQ_TYPE_NAME {
    ORGANIZATION = "Организация",
    BUDGET = "Бюджетники",
    IP = "ИП",
    FIZ = "Физ лицо",
}


export enum SupplyTypeEnum {
    INTERNET = 'internet',
    PROXIMA = 'proxima'
}

export type SupplyTypesType = SupplyTypeEnum.INTERNET | SupplyTypeEnum.PROXIMA
export enum CONTRACT_LTYPE {

    SERVICE = 'service',
    ABON = 'abon',
    LIC = 'lic',
    KEY = 'key',
}