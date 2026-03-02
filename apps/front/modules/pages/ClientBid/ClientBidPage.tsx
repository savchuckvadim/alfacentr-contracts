'use client';
import { useApp } from '@/modules/app';
import { DealInfo } from '@/modules/entities/deal/ui/DealInfo';

export const ClientBidPage = () => {
    const { isClient } = useApp();
    if (!isClient) {
        return null;
    }
    return (
        <div className="container mx-auto px-4 py-6">
            <DealInfo />
        </div>
    );
};
