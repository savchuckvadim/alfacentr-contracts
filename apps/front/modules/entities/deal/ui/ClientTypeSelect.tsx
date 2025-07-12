'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { useDeal } from "../hook/useDeal";
import { BxDealDataKeys, TFieldSelect } from "@alfa/entities";

export const ClientTypeSelect = () => {
    const { getFieldByCode, updateFieldWithAPI } = useDeal();
    const clientTypeField = getFieldByCode(BxDealDataKeys.organization_type) as TFieldSelect;
    const clientType = clientTypeField?.value as string;
    const clientTypeList = clientTypeField?.list;
    const clientTypeOptions = clientTypeList?.map((item) => (
        <option key={item.bitrixId} value={item.bitrixId}>{item.name}</option>
    ));
    return <div>
        <Select value={clientType} onValueChange={(value) => {
            updateFieldWithAPI(BxDealDataKeys.organization_type, value);
        }}
            defaultValue={clientType}
        >
            <SelectTrigger>
                <SelectValue placeholder="Выберите тип клиента" />
            </SelectTrigger>
            <SelectContent>

                {
                    clientTypeList?.map((item) => (
                        <SelectItem key={item.bitrixId} value={item.bitrixId}>{item.name}</SelectItem>
                    ))
                }
            </SelectContent>
        </Select>

    </div>;
};  