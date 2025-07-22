import { TDealData, TFieldSelect, TField } from '@alfa/entities';

type IDealField = TFieldSelect | TField;

export type IDealFieldsData = IDealField & {
    value: string | string[] | number | number[];
};
