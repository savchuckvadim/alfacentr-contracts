'use client';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import Link from 'next/link';

export const CompanyBrand = () => {
    const app = useAppSelector(state => state.app);
    const company = useAppSelector(state => state.app.bitrix.company);
    const deal = useAppSelector(state => state.deal.dealData);
    if (!company || !deal) {
        return null;
    }
    const innField = deal.find(field => field.code === 'inn');
    const inn = innField?.value ? `ИНН: ${innField?.value}` : '';
    const url = `https://${app.domain}/crm/company/details/${company?.ID}/`;
    return (
        <Link
            target="_blank"
            href={url}
            className="cursor-pointer text-xl font-semibold text-foreground hover:text-blue-600 transition-colors"
        >
            {company?.TITLE}{' '}
            {inn && <span className="text-sm text-gray-500">{inn}</span>}
        </Link>
    );
};
