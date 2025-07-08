'use client'

import { useDeal } from "../hook/useDeal";
import { BxDealDataKeys, TFieldSelect } from "@alfa/entities";

export const ClientTypeSelect = () => {
    const { getFieldByCode, updateField } = useDeal();
    const clientTypeField = getFieldByCode(BxDealDataKeys.organization_type) as TFieldSelect;
    const clientType = clientTypeField?.value as string;
    const clientTypeList = clientTypeField?.list;
    const clientTypeOptions = clientTypeList?.map((item) => (
        <option key={item.bitrixId} value={item.bitrixId}>{item.name}</option>
    ));
    return <div>
        <select value={clientType} onChange={(e) => {
            const value = e.target.value;
            updateField(BxDealDataKeys.organization_type, value);
        }}>
            {clientTypeOptions}
        </select>
    </div>;
};  