import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FieldsFactoryService } from './factory/fields-factory.service';
import { PBXService } from '@/modules/pbx';
import { UpdateDealDto } from './dto/update-deal.dto';
@ApiTags('Bitrix Fields')
@Controller('bitrix-fields')
export class FieldsController {
  constructor(
    private readonly factory: FieldsFactoryService,
    private readonly pbx: PBXService
  ) { }

  @ApiOperation({ summary: 'Получить пользовательские поля Bitrix' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает список пользовательских полей',

  })
  @Get('')
  async getUserFields() {
    const domain = 'alfacentr.bitrix24.ru'
    const service = await this.factory.getService(domain);
    return await service.getDealFields();
  }

  @ApiOperation({ summary: 'Получить перечисления пользовательских полей Bitrix' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает список перечислений пользовательских полей',

  })
  @Get('enumeration')
  async getUserFieldsEnumeration() {
    const domain = 'alfacentr.bitrix24.ru'
    const service = await this.factory.getService(domain);
    return service.getUserFieldsEnumeration();
  }

  @Get('deal/:dealId')
  async getFieldByBitrixId(@Param('dealId') dealId: string) {
    const domain = 'alfacentr.bitrix24.ru'
    const { bitrix } = await this.pbx.init(domain)
    const deal = await bitrix.deal.get(Number(dealId), ['UF_CRM_1744358047'])
    const result = deal.result['UF_CRM_1744358047']
    return { deal, result }
  }

  @ApiOperation({ summary: 'Обновить поле заявки Bitrix' })
  @Put('deal/:dealId')
  async updateFieldByBitrixId(@Param('dealId') dealId: string, @Body() body: UpdateDealDto) {
    const domain = 'alfacentr.bitrix24.ru'
    const { bitrix } = await this.pbx.init(domain)
    const deal = await bitrix.deal.update(Number(dealId), { [body.fieldId]: body.value })
    return deal
  }

}