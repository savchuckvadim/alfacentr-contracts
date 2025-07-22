'use client';
import { useApp } from '@/modules/app';
import { BxRqPage } from '@/modules/entities/bx-rq/ui/BxRqPage';

function Page() {
    const { isClient } = useApp();
    if (!isClient) {
        return null;
    }
    return (
        <div>
            <BxRqPage />
        </div>
    );
}

export default Page;
