'use client';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { Tooltip } from '@/modules/shared';
import Link from 'next/link';

export const CompanyBrand = () => {
    const app = useAppSelector(state => state.app);
    const company = useAppSelector(state => state.app.bitrix.company);
    const bxDeal = useAppSelector(state => state.app.bitrix.deal);
    const deal = useAppSelector(state => state.deal.dealData);
    if (!company || !deal) {
        return null;
    }
    const innField = deal.find(field => field.code === 'inn');
    const inn = innField?.value ? `, инн: ${innField?.value}` : '';
    const url = `https://${app.domain}/crm/company/details/${company?.ID}/`;
    const dealUrl = `https://${app.domain}/crm/deal/details/${bxDeal?.ID}/`;
    return (
        <div>
            <Tooltip content="Перейти в компанию в Битрикс">
                <div
                    className="flex flex-col gap-1 cursor-pointer  font-bold text-foreground hover:text-primary/90 transition-colors max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{
                        cursor: 'pointer',
                    }}
                >
                    <Link target="_blank" href={url} className='text-md'>
                        {company?.TITLE} {inn && <span >{inn}</span>}
                    </Link>
                </div>
            </Tooltip>
            <Tooltip content="Открыть сделку">
                <div
                    className="flex flex-col gap-1 cursor-pointer  text-foreground hover:text-primary/90 transition-colors max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{
                        cursor: 'pointer',
                    }}
                >

                    <Link target="_blank" href={dealUrl} className='text-xs'>
                        {bxDeal?.TITLE}
                    </Link>
                </div>
            </Tooltip>
        </div>

    );
};
