'use client';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { Tooltip } from '@/modules/shared';
import Link from 'next/link';

export const CompanyBrand = () => {
    const app = useAppSelector(state => state.app);
    const company = useAppSelector(state => state.app.bitrix.company);
    const deal = useAppSelector(state => state.deal.dealData);
    if (!company || !deal) {
        return null;
    }
    const innField = deal.find(field => field.code === 'inn');
    const inn = innField?.value ? `, инн: ${innField?.value}` : '';
    const url = `https://${app.domain}/crm/company/details/${company?.ID}/`;
    return (
        <Tooltip content="Перейти в компанию в Битрикс">
            <div
                className="cursor-pointer text-xl font-bold text-foreground hover:text-primary/90 transition-colors max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap"
                style={{
                    cursor: 'pointer',
                }}
            >
                <Link target="_blank" href={url}>
                    {company?.TITLE} {inn && <span className="">{inn}</span>}
                </Link>
            </div>
        </Tooltip>
    );
};
