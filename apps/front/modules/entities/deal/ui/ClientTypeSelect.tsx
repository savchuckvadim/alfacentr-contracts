'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useDeal } from '../hook/useDeal';
import { BxDealDataKeys, TFieldSelect } from '@alfa/entities';
import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';
import { Tooltip } from '@/modules/shared';

export const ClientTypeSelect = () => {
    const { getFieldByCode, updateFieldWithAPI, fetched, loading } = useDeal();
    const clientTypeField = getFieldByCode(
        BxDealDataKeys.organization_type,
    ) as TFieldSelect;
    const clientType = clientTypeField?.value as string;
    const clientTypeList = clientTypeField?.list;
    // const clientTypeOptions = clientTypeList?.map(item => (
    //     <option key={item.bitrixId} value={item.bitrixId}>
    //         {item.name}
    //     </option>
    // ));
    if (loading || !fetched) {
        return <MicroPreloader />;
    }
    return (
        <Tooltip content="Текущий тип клиента">
            <div>
                <Select
                    value={clientType}
                    onValueChange={value => {
                        updateFieldWithAPI(
                            BxDealDataKeys.organization_type,
                            Number(value),
                        );
                    }}
                    defaultValue={clientType}
                >
                    <SelectTrigger
                        style={{
                            cursor: 'pointer',
                        }}
                        size="sm"
                        className="h-5 border-primary/30 text-primary w-[200px]"
                    >
                        <SelectValue placeholder="Выберите тип клиента" />
                    </SelectTrigger>
                    <SelectContent
                        className="text-primary"
                        style={{
                            cursor: 'pointer',
                        }}
                    >
                        {clientTypeList?.map(item => (
                            <SelectItem
                                key={item.bitrixId}
                                value={item.bitrixId}
                            >
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </Tooltip>
    );
};
