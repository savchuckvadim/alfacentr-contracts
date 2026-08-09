import { BitrixService, IBXCompany, IBXDeal } from '@/modules/bitrix';
import { BxCompanyData, DEAL_FOUND_COMPANIES_COUNT_BITRIX_ID } from '@alfa/entities';
import { BitrixEntityType } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';

export class BxCompanyService {
    constructor(private readonly bitrix: BitrixService) { }

    public async searchCompany(
        deal: IBXDeal,
        inn: string,
    ): Promise<IBXCompany[] | null> {
        const dealId = Number(deal.ID);
        console.log('dealId', dealId);
        const innFieldId = BxCompanyData.inn.bitrixId;
        let comment = '❌ ИНН не указан';
        let companies: IBXCompany[] = [];
        if (inn) {
            const response = await this.bitrix.company.getList(
                {
                    [`%${innFieldId}`]: inn,
                },
                ['ID', 'TITLE'],
            );
            companies = response.result;
            if (companies.length > 0) {
                comment = this.getComment(companies, inn);
            } else {
                comment = `❌ Не найдены компании по ИНН: ${inn}`;
            }
        }

        //счетчик пишем всегда, в том числе 0 — по нему в списке сделок
        //фильтруются как ненайденные, так и неоднозначные (больше одной) компании
        await this.updateDealCompany(deal, companies);
        await this.setTimelineComment(dealId, comment);
        return companies;
    }

    /**
     * Пишет в сделку количество найденных по ИНН компаний и,
     * если сделка еще без компании, привязывает первую из найденных
     */
    protected async updateDealCompany(deal: IBXDeal, companies: IBXCompany[]) {
        if (!deal) {
            return;
        }

        const dealFields: Record<string, string | number> = {
            [DEAL_FOUND_COMPANIES_COUNT_BITRIX_ID]: companies.length,
        };

        if (companies.length > 0 && !deal.COMPANY_ID) {
            dealFields.COMPANY_ID = String(companies[0].ID);
        }

        await this.bitrix.deal.update(deal.ID, dealFields);
    }
    protected getComment(companies: IBXCompany[], inn: string) {
        let info = '';
        companies.forEach((company) => {
            if (company.TITLE) {
                if (!info)
                    info =
                        '🏢[B]' +
                        `  Найденные компании c ИНН: ${inn}` +
                        '[/B] \n';
                const companyLink = `🔹 [URL=https://alfacentr.bitrix24.ru/crm/company/details/${company.ID}/]${company.TITLE}[/URL]`;
                info += companyLink + ' \n';
            }
        });

        return info;
    }
    protected async setTimelineComment(dealId: number, comment: string) {
        await this.bitrix.timeline.addTimelineComment({
            ENTITY_TYPE: BitrixEntityType.DEAL,
            ENTITY_ID: dealId,
            COMMENT: comment,
            AUTHOR_ID: '502',
        });
    }
}
