import { BitrixService, IBXCompany, IBXDeal } from '@/modules/bitrix';
import { BxCompanyData } from '@alfa/entities';
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

                await this.updateDealCompanyId(deal, Number(companies[0].ID));
            } else {
                comment = `❌ Не найдены компании по ИНН: ${inn}`;
            }
        }

        await this.setTimelineComment(dealId, comment);
        return companies;
    }
    protected async updateDealCompanyId(deal: IBXDeal, companyId: number) {
        if (deal && !deal.COMPANY_ID) {
            await this.bitrix.deal.update(deal.ID, {
                COMPANY_ID: String(companyId),
            })
        }
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
