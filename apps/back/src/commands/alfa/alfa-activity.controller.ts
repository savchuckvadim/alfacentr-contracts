import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
    ActivityResponseDto,
    AlfaActivityQueryDto,
} from './dto/alfa-activity.dto';
import {
    AlfaActivityService,
    CompanyUpdateResult,
} from './alfa-activity.service';
import { IBitrixBatchResponseResult } from '@/modules/bitrix/core/interface/bitrix-api.intterface';

@ApiTags('Alfa Activity Projects')
@Controller('alfa')
export class AlfaActivityController {
    constructor(private readonly alfaActivityService: AlfaActivityService) {}

    @ApiOperation({ summary: 'Получить активности и обновить компании' })
    @ApiResponse({
        status: 200,
        description: 'Список активностей и результаты обновления компаний',
        type: ActivityResponseDto,
    })
    @Get('activity')
    async getActivityAndUpdateCompanies(
        @Query() query: AlfaActivityQueryDto,
    ): Promise<any> {
        const subject = query.subject || 'юр. форум';
        const ownerTypeId = query.ownerTypeId ?? 4;

        const result =
            await this.alfaActivityService.processActivitiesAndUpdateCompanies(
                subject,
                ownerTypeId,
            );

        return result;
    }

    @ApiOperation({ summary: 'Собрать компании из активностей' })
    @ApiResponse({
        status: 200,
        description: 'Список активностей и уникальные компании',
        schema: {
            type: 'object',
            // properties: {
            //     activities: {
            //         type: 'array',
            //         description: 'Список активностей',
            //     },
            //     companies: {
            //         type: 'array',
            //         description: 'Уникальные ID компаний',
            //     },
            // },
        },
    })
    @Get('activity/collect')
    async collectCompaniesFromActivities(@Query() query: AlfaActivityQueryDto) {
        const subject = query.subject || 'юр. форум';
        const ownerTypeId = query.ownerTypeId ?? 4;

        try {
            const result =
                await this.alfaActivityService.collectCompaniesFromActivities(
                    subject,
                    ownerTypeId,
                );

            return result;
        } catch (error) {
            return {
                activities: [],
                companies: [],
                error: error.message,
            };
        }
    }

    @ApiOperation({ summary: 'Обновить компании по списку ID' })
    @ApiResponse({
        status: 200,
        description: 'Результаты обновления компаний',
        // schema: {
        //     type: 'object',
        //     properties: {
        //         results: {
        //             type: 'array',
        //             description: 'Результаты обновления',
        //         },
        //     },
        // },
    })
    @Get('activity/update-companies')
    async updateCompanies(
        @Query('companyIds') companyIds: string,
    ): Promise<{ results: IBitrixBatchResponseResult[]; error?: string }> {
        try {
            const ids = companyIds.split(',').map((id) => Number(id.trim()));
            const results = await this.alfaActivityService.updateCompanies(ids);

            return {
                results,
            };
        } catch (error) {
            return {
                results: [],
                error: error.message,
            };
        }
    }
}
