import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiProperty, ApiQuery, ApiTags } from "@nestjs/swagger";
import { SmartUseCase } from "./use-cases/smart.use-case";
import { AddSmartItemDto } from "./dto/smart-item.dto";
import { CategoryIdEnum, SmartStageEnum } from "@alfa/entities";

@ApiTags('Alfa Smart Item')
@Controller('alfa-smart-item')
export class AlfaSmartItemController {
    constructor(
        private readonly useCase: SmartUseCase
    ) { }

    @ApiOperation({ summary: 'Get smarts' })
    @Get('get-list/:entityTypeId')
    async getList(@Param('entityTypeId') entityTypeId: string, @Query('domain') domain: string) {
        return await this.useCase.getList(entityTypeId, domain);
    }

    @ApiOperation({ summary: 'Add smart' }) 
    @ApiBody({ type: AddSmartItemDto, description: 'Add smart' })
    @ApiQuery({ name: 'domain', example: 'alfacentr.bitrix24.ru' })
    @ApiQuery({ name: 'categoryId', enum: CategoryIdEnum })
    @ApiQuery({ name: 'stageId', enum: SmartStageEnum })
    @Post('add')
    async add(
        @Body() body: AddSmartItemDto, 
        @Query('domain') domain: string,
        @Query('categoryId') categoryId: CategoryIdEnum,
        @Query('stageId') stageId: SmartStageEnum
    ) {
        return await this.useCase.add(body, domain, categoryId, stageId);
    }

 
}