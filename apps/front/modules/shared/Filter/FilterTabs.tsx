'use client';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { useState, ReactNode } from 'react';

export interface TabItem {
    value: string;
    label: string;
    icon?: React.ReactNode;
    count?: number;
    content: ReactNode;
}

export interface FilterTabsProps {
    tabs: TabItem[];
    defaultValue?: string;
    className?: string;
    tabsListClassName?: string;
    tabsContentClassName?: string;
    onTabChange?: (value: string) => void;
    showCounts?: boolean;
    gridCols?: number;
}

export const FilterTabs = ({
    tabs,
    defaultValue,
    className = 'space-y-4',
    tabsListClassName,
    tabsContentClassName = 'space-y-4',
    onTabChange,
    showCounts = true,
    gridCols = 5,
}: FilterTabsProps) => {
    const [activeTab, setActiveTab] = useState(
        defaultValue || tabs[0]?.value || '',
    );

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        onTabChange?.(value);
    };

    if (!tabs.length) {
        return null;
    }

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className={className}
        >
            <TabsList
                className={`grid w-full grid-cols-${gridCols} ${tabsListClassName || ''}`}
            >
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex items-center gap-2"
                        >
                            {Icon ? Icon : <></>}
                            {tab.label}
                            {showCounts &&
                                tab.count !== undefined &&
                                ` (${tab.count})`}
                        </TabsTrigger>
                    );
                })}
            </TabsList>

            {tabs.map(tab => (
                <TabsContent
                    key={tab.value}
                    value={tab.value}
                    className={tabsContentClassName}
                >
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    );
};
