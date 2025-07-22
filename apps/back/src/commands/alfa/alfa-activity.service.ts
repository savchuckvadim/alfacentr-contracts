import { Injectable, Logger } from '@nestjs/common';
import { PBXService } from '@/modules/pbx';
import { BxActivityRepository } from '@/modules/bitrix/domain/activity/bx-activity.repository';
import { BxCompanyService } from '@/modules/bitrix/domain/crm/company/services/bx-company.service';
import { delay } from '@/lib';
import { BXActivityRequestFields } from '@/modules/bitrix/domain/activity/interfaces/bx-activity.interface';
import { companies } from './temp/companies';
import { IBitrixBatchResponseResult } from '@/modules/bitrix/core/interface/bitrix-api.intterface';

type ActivityData = any;

export interface CompanyUpdateResult {
    companyId: number;
    updateResult?: any;
    error?: string;
    success: boolean;
}

@Injectable()
export class AlfaActivityService {
    private readonly logger = new Logger(AlfaActivityService.name);

    constructor(private readonly pbxService: PBXService) {}

    /**
     * Собирает компании из активностей по заданным критериям
     */
    async collectCompaniesFromActivities(
        subject: string = 'юр. форум', //юрфорум ЮР.ФОРУМ
        ownerTypeId: number = 4,
    ): Promise<{ report: string; companies: number[] }> {
        const domain = 'alfacentr.bitrix24.ru';
        const { bitrix } = await this.pbxService.init(domain);

        const activityRepo = new BxActivityRepository(bitrix.api);
        const allActivities: ActivityData[] = [];
        const companies = new Set<number>();

        const names = [
            'юрфорум',
            'юр.форум',
            'юр. форум',
            'юр форум',
            'юр  форум',
            'юридический форум',
            'ВЮФ',
        ];

        for (const subject of names) {
            let lastActivityId = 0;
            let finish = false;
            let pagesCount = 0;

            this.logger.log(
                `Начинаем сбор компаний из активностей. Тема: ${subject}, тип владельца: ${ownerTypeId}`,
            );

            while (!finish) {
                // Задержка между запросами
                await delay(1200);

                const filter: Partial<BXActivityRequestFields> = {
                    '>ID': lastActivityId,
                    OWNER_TYPE_ID: ownerTypeId,
                    '%SUBJECT': subject,
                };

                const response = await activityRepo.getList(
                    filter,
                    ['ID', 'OWNER_ID', 'SUBJECT'],
                    { ID: 'ASC' },
                );

                if (response && response.result && response.result.length > 0) {
                    for (const activity of response.result) {
                        allActivities.push(activity);
                        lastActivityId = Number(activity.ID);

                        if (
                            activity.OWNER_ID &&
                            activity.OWNER_ID !== undefined
                        ) {
                            companies.add(Number(activity.OWNER_ID));
                        }
                    }
                    pagesCount++;
                    this.logger.log(
                        `Обработана страница ${pagesCount}, найдено активностей: ${response.result.length}`,
                    );
                } else {
                    finish = true;
                }
            }
        }
        const report = `Сбор завершен. Всего активностей: ${allActivities.length}, уникальных компаний: ${companies.size}`;

        this.logger.log(report);

        return {
            report,
            // activities: allActivities,
            companies: Array.from(companies),
        };
    }

    /**
     * Обновляет компании с заданными полями
     */
    async updateCompanies(
        companyIds: Set<number> | number[],
    ): Promise<IBitrixBatchResponseResult[]> {
        const companiesArray = Array.from(companyIds);
        this.logger.log(
            `Начинаем обновление компаний. Количество: ${companiesArray.length}`,
        );

        const domain = 'alfacentr.bitrix24.ru';
        const { bitrix } = await this.pbxService.init(domain);

        // const companyService = new BxCompanyService();
        // companyService.init(bitrix.api);

        // const results: CompanyUpdateResult[] = [];

        for (const companyId of companiesArray) {
            // Задержка перед обновлением компании

            bitrix.batch.company.update(`update_${companyId}`, companyId, {
                // 'UF_CRM_1720600919': 'юрфорум',
                UF_CRM_1721825948: [15638],
            });
        }

        const results = await bitrix.api.callBatchWithConcurrency(3);
        // const successCount = results.filter(r => r.success).length;
        // const errorCount = results.filter(r => !r.success).length;

        // this.logger.log(`Обновление завершено. Успешно: ${successCount}, ошибок: ${errorCount}`);

        return results;
    }

    /**
     * Полный процесс: сбор компаний и их обновление
     */
    async processActivitiesAndUpdateCompanies(
        subject: string = 'юр. форум',
        ownerTypeId: number = 4,
    ): Promise<{
        // activities: ActivityData[];
        count: number;
        responses: IBitrixBatchResponseResult[];
    }> {
        this.logger.log(
            'Начинаем полный процесс обработки активностей и обновления компаний',
        );

        // Шаг 1: Собираем компании из активностей
        // const { companies } = await this.collectCompaniesFromActivities(subject, ownerTypeId);
        const filtredCompanies = companies.filter(
            (company, index) => index > 1500,
        );
        // Шаг 2: Обновляем компании
        const responses = await this.updateCompanies(filtredCompanies);

        const count = companies.length;

        return {
            // activities,
            count,
            responses,
        };
    }
}
