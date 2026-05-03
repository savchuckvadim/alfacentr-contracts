import '@workspace/ui/globals.css';

import { Header } from '@/modules/widgetes/Header/Header';
import { CompanyBrand } from '@/modules/entities/company';
import { App } from '@/modules/app';

import type { ReactElement } from 'react';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): ReactElement  {
    return (
        <div>
            <Header brandComponent={<CompanyBrand />} />
            <App>{children}</App>
        </div>
    );
}
