import {
    Controller,
    Post,
    Body,
    Param,
    ValidationPipe,
    Get,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OnDealInitUseCase } from '../use-cases/on-deal-init.use-case';
import { BitrixHookDto } from '@/lib/dto';
import { OnDealInitRequestDto } from '../dto/on-deal-init-request.dto';
import { FrontDealUseCase } from '../use-cases/front-deal.use-case';

@ApiTags('Alfa')
@Controller('seminar')
export class OnDealInitController {
    constructor(
        private readonly alfaUseCase: OnDealInitUseCase,
        private readonly frontDealUseCase: FrontDealUseCase
    ) { }

    @ApiOperation({ summary: 'On deal init' })
    @Post('create-deal/:dealId')
    async createDeal(
        @Body(ValidationPipe) body: BitrixHookDto,
        @Param('dealId') dealId: string,
    ) {
        const fullDto = {
            ...body,
            dealId: Number(dealId),
        } as OnDealInitRequestDto;

        return this.alfaUseCase.onDealCreate(fullDto);
    }




    @ApiOperation({ summary: 'Get deal values' })
    @Post('get-deal-values/:dealId')
    async getDealValues(
        @Body(ValidationPipe) body: BitrixHookDto,
        @Param('dealId') dealId: string,
    ) {

        await this.frontDealUseCase.init(body.auth.domain)
        return this.frontDealUseCase.getDealValues(Number(dealId));
    }


    @ApiOperation({ summary: 'Get Fields Ids' })
    @Post('get-fields-data')
    async getFieldsIds(
        @Body(ValidationPipe) body: BitrixHookDto,
    ) {

        await this.frontDealUseCase.init(body.auth.domain)
        return this.frontDealUseCase.getFieldsIds();
    }
}
