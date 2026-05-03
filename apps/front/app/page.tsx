import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';

import type { ReactElement } from 'react';

export default function Page(): ReactElement  {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-primary/30  flex items-center justify-center p-4">
            <Link href="/bitrix/main">
                <Button variant="default"> Начать</Button>
            </Link>
        </div>
    );
}
