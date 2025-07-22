import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FieldsFactoryService } from './factory/fields-factory.service';
import { PBXService } from '@/modules/pbx';
import { UpdateDealDto } from './dto/update-deal.dto';
import { EBXEntity } from '@/modules/bitrix';

@ApiTags('Bitrix Fields')
@Controller('bitrix-fields')
export class FieldsController {
    constructor(
        private readonly factory: FieldsFactoryService,
        private readonly pbx: PBXService,
    ) {}

    @ApiOperation({ summary: 'Получить пользовательские поля Bitrix' })
    @ApiResponse({
        status: 200,
        description: 'Возвращает список пользовательских полей',
    })
    @Get('')
    async getUserFields() {
        const domain = 'alfacentr.bitrix24.ru';
        const service = await this.factory.getService(domain);
        return await service.getDealFields();
    }

    @ApiOperation({
        summary: 'Получить пользовательские поля Bitrix для Альфазаявки',
    })
    @ApiResponse({
        status: 200,
        description: 'Возвращает список пользовательских полей',
    })
    @Get('deal-data')
    async getDealDataFields() {
        const domain = 'alfacentr.bitrix24.ru';
        const service = await this.factory.getService(domain);
        return await service.getBxDealDataFields();
    }

    @ApiOperation({
        summary: 'Получить перечисления пользовательских полей Bitrix',
    })
    @ApiResponse({
        status: 200,
        description: 'Возвращает список перечислений пользовательских полей',
    })
    @Get('enumeration')
    async getUserFieldsEnumeration() {
        const domain = 'alfacentr.bitrix24.ru';
        const service = await this.factory.getService(domain);
        return service.getUserFieldsEnumeration();
    }
    @ApiOperation({ summary: 'Получить значение поля в сделке' })
    @Get('deal/:dealId')
    async getFieldByBitrixId(@Param('dealId') dealId: string) {
        const domain = 'alfacentr.bitrix24.ru';
        const { bitrix } = await this.pbx.init(domain);
        const deal = await bitrix.deal.get(Number(dealId), [
            'UF_CRM_1744358047',
        ]);
        const result = deal.result['UF_CRM_1744358047'];
        return { deal, result };
    }

    @ApiOperation({ summary: 'Обновить поле сделки Bitrix' })
    @Put('deal/:dealId')
    async updateFieldByBitrixId(
        @Param('dealId') dealId: string,
        @Body() body: UpdateDealDto,
    ) {
        const domain = 'alfacentr.bitrix24.ru';
        const { bitrix } = await this.pbx.init(domain);
        const deal = await bitrix.deal.update(Number(dealId), {
            [body.fieldId]: body.value,
        });
        return deal;
    }

    @ApiOperation({ summary: 'Получить поле по ID' })
    @ApiQuery({
        name: 'bitrixId',
        description: 'ID поля в Bitrix24',
        type: String,
    })
    @ApiQuery({
        name: 'entity',
        description: 'Тип сущности Bitrix24',
        enum: EBXEntity,
        enumName: 'EBXEntity',
    })
    @Get('field')
    async getFieldByBitrixIdEntity(
        @Query('bitrixId') bitrixId: string,
        @Query('entity') entity: EBXEntity,
    ) {
        const domain = 'alfacentr.bitrix24.ru';
        const service = await this.factory.getService(domain);
        const result = await service.getFieldByBitrixId(bitrixId, entity);
        return { bitrixId, entity, result };
    }

    @ApiOperation({ summary: 'Получить поле по ID' })
    @ApiQuery({
        name: 'id',
        description: 'ID поля в Bitrix24',
        type: String,
    })
    @ApiQuery({
        name: 'entity',
        description: 'Тип сущности Bitrix24',
        enum: EBXEntity,
        enumName: 'EBXEntity',
    })
    @Get('field/id')
    async getFieldById(
        @Query('id') id: string,
        @Query('entity') entity: EBXEntity,
    ) {
        const domain = 'alfacentr.bitrix24.ru';
        const service = await this.factory.getService(domain);
        const result = await service.getFieldById(id, entity);
        return { id, entity, result };
    }
}
