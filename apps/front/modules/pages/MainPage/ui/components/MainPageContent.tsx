'use client';

import { FilterTabs, SimpleCard } from '@/modules/shared';
import { Package } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePpkApplicationLive } from '@/modules/widgetes';
import { useIsUpContractType } from '@/modules/features';
import {
    IMainPageWidgetContext,
    MAIN_PAGE_WIDGETS,
} from '../../config/main-page-widgets';

export const MainPageContent = () => {
    const [filter, setFilter] = useState<string>('main');
    const { isUp } = useIsUpContractType();

    /**
     * Состояние приложения ППК поднято сюда, а не в сам виджет: по нему же
     * решается, показывать ли таб и карточку на главном. Участников и
     * программы могут создать в любой момент — состояние живёт в стору,
     * поэтому виджет появится сам, как только появится хотя бы одна пара
     * «участник — программа». Одна копия состояния на оба места показа:
     * правки на главном табе видны в своём табе и наоборот.
     */
    const ppk = usePpkApplicationLive();

    const ctx = useMemo<IMainPageWidgetContext>(
        () => ({
            isUp,
            withPpkApplication: ppk.isPpkContract && ppk.hasRows,
            ppk,
        }),
        [isUp, ppk],
    );

    const tabs = useMemo(() => {
        const visible = MAIN_PAGE_WIDGETS.filter(widget =>
            widget.isVisible(ctx),
        );
        const mainCards = visible
            .filter(widget => widget.main)
            .sort((a, b) => (a.main?.order ?? 0) - (b.main?.order ?? 0));

        return [
            {
                value: 'main',
                label: 'Основные данные',
                icon: <Package />,
                content: (
                    <div className="grid grid-cols-1 gap-6">
                        {mainCards.map(widget => (
                            <SimpleCard
                                key={widget.value}
                                withCollapse={false}
                                title={widget.main?.title}
                            >
                                {widget.render(ctx)}
                            </SimpleCard>
                        ))}
                    </div>
                ),
            },
            ...visible.map(widget => ({
                value: widget.value,
                label: widget.label,
                icon: widget.icon,
                content: widget.render(ctx),
            })),
        ];
    }, [ctx]);

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
