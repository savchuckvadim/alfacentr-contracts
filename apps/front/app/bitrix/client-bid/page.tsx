'use client';
import { DealInfo } from '@/modules/entities';
import { useApp } from '@/modules/app';

export default function ClientBid() {
    const { isClient } = useApp();
    if (!isClient) {
        return null;
    }
    return (
        <div className="max-w-[1600px] mx-auto px-4 py-6">
            <DealInfo />
        </div>
    );
}
