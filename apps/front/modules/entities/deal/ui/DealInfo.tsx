'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { SimpleCard } from '@/modules/shared';
import { BxParticipantsDataKeys } from '@alfa/entities';

export const DealInfo = () => {
    const { dealData } = useAppSelector(state => state.deal);

    return (
        <div>
            <SimpleCard title="Заявка">
                {dealData?.map(field => {
                    let value = field.value;
                    if (
                        !Array.isArray(field.value) &&
                        field.type === 'enumeration' &&
                        'list' in field &&
                        field.list &&
                        field.list.length > 0
                    ) {
                        if (
                            field.code === BxParticipantsDataKeys.format ||
                            field.code === BxParticipantsDataKeys.format_v2
                        ) {
                        }
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
