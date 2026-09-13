'use client';

import { FilterTabs, SimpleCard } from '@/modules/shared';
import { CalendarDaysIcon, CheckCircle, Package, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ParticipantsTableWidget } from '@/modules/widgetes/Participant/ParticipantsTable/ParticipantsTableWidget';
import {
    ContractPreview,
    ProductsTableWidget,
    PpkApplicationTableWidget,
    usePpkApplicationLive,
} from '@/modules/widgetes';
import { useIsUpContractType } from '@/modules/features';

export const MainPageContent = () => {
    const [filter, setFilter] = useState<string>('main');
    const { isUp } = useIsUpContractType();

    /**
     * Состояние приложения ППК поднято сюда, а не в сам виджет: по нему же
     * решается, показывать ли таб. Участников и программы могут создать
     * в любой момент — состояние живёт в стору, поэтому таб появится сам,
     * как только появится хотя бы одна пара «участник — программа».
     */
    const ppk = usePpkApplicationLive();
    const withPpkApplication = ppk.isPpkContract && ppk.hasRows;

    const tabs = useMemo(() => {
        const items = [
            {
                value: 'main',
                label: 'Основные данные',
                icon: <Package />,
                content: (
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                        <SimpleCard
                            withCollapse={false}
                            title="Товары"
                            children={<ProductsTableWidget />}
                        />
                        {!isUp && (
                            <SimpleCard
                                withCollapse={false}
                                children={<ParticipantsTableWidget />}
                            />
                        )}
                        <SimpleCard
                            withCollapse={false}
                            title="Договор"
                            children={<ContractPreview />}
                        />
                    </div>
                ),
            },
            {
                value: 'products',
                label: 'Товары',
                icon: <Package />,
                content: <ProductsTableWidget />,
            },
        ];

        if (!isUp) {
            items.push({
                value: 'participants',
                label: 'Участники',
                icon: <Users />,
                content: <ParticipantsTableWidget />,
            });
        }
        if (withPpkApplication) {
            items.push({
                value: 'ppk-application',
                label: 'Приложение ППК',
                icon: <CalendarDaysIcon />,
                content: <PpkApplicationTableWidget ppk={ppk} />,
            });
        }
        items.push({
            value: 'contract',
            label: 'Что будет в договоре',
            icon: <CheckCircle />,
            content: <ContractPreview />,
        });
        return items;
    }, [isUp, withPpkApplication, ppk]);

    /**
     * Открытый таб может исчезнуть: убрали последнюю программу ППК или
     * сменился тип договора. Без возврата на «Основные данные» контент
     * оказался бы пустым.
     */
    useEffect(() => {
        if (!tabs.some(tab => tab.value === filter)) setFilter('main');
    }, [tabs, filter]);

    const title = useMemo(
        () =>
            tabs.find(tab => tab.value === filter)?.label || 'Основные данные',
        [filter, tabs],
    );

    return (
        <div className="bg-background p-5 rounded-2xl">
            <h3 className="text-2xl mb-4 font-bold">{title}</h3>

            <FilterTabs
                tabs={tabs}
                defaultValue={filter}
                onTabChange={setFilter}
                className="w-full space-y-6"
            />
        </div>
    );
};
