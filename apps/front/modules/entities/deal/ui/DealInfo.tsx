'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useIsUpContractType } from '@/modules/features';
import { SimpleCard } from '@/modules/shared';

const getBooleanFieldValue = (value: string | number | string[] | number[]) => {
    return value === '0' || value === 0 ? 'Нет' : value === '1' || value === 1 ? 'Да' : value;
};
export const DealInfo = () => {
    const { dealData } = useAppSelector(state => state.deal);
    const { isUp } = useIsUpContractType();
    console.log(isUp);
    return (
        <div>
            <SimpleCard title="Заявка">
                {dealData?.map(field => {
                    const group = field.group

                    if (group === 'up' && !isUp) {
                        return null;
                    }
                    if (group === 'seminar' && isUp) {
                        return null;
                    }

                    let value = getBooleanFieldValue(field.value);
                    if (
                        !Array.isArray(field.value) &&
                        field.type === 'enumeration' &&
                        'list' in field &&
                        field.list &&
                        field.list.length > 0
                    ) {
                        // if (
                        //     field.code === BxParticipantsDataKeys.format ||
                        //     field.code === BxParticipantsDataKeys.format_v2
                        // ) {
                        // }
                        value =
                            field.list.find(
                                item => item.bitrixId === field.value,
                            )?.name || 'Не установлено';
                    } else if (
                        Array.isArray(field.value) &&
                        field.type === 'enumeration' &&
                        'list' in field &&
                        field.list &&
                        field.list.length > 0
                    ) {
                        value = 'Не установлено';
                        if (field.value && Array.isArray(field.value)) {
                            const values = field.value as number[];
                            const names = values.map(
                                value =>
                                    field.list.find(
                                        item => Number(item.bitrixId) === value,
                                    )?.name,
                            );
                            value = names.join(', ');
                        }
                    }
                    return (
                        <div key={field.bitrixId}>
                            <p>
                                <span className="font-bold">{field.name}:</span>{' '}
                                {value}
                            </p>
                        </div>
                    );
                })}
            </SimpleCard>
        </div>
    );
};
