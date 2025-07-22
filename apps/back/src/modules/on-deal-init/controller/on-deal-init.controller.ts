import {
    Controller,
    Post,
    Body,
    Logger,
    Param,
    ValidationPipe,

} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OnDealInitUseCase } from '../use-cases/on-deal-init.use-case';
import { BitrixHookDto } from '@/lib/dto';
import { OnDealInitRequestDto } from '../dto/on-deal-init-request.dto';

@ApiTags('Alfa')
@Controller('seminar')
export class OnDealInitController {
    constructor(private readonly alfaUseCase: OnDealInitUseCase) {}

    @ApiOperation({ summary: 'On deal init' })
    @Post('create-deal/:dealId')
    async createDeal(
        @Body(ValidationPipe) body: BitrixHookDto,
        @Param('dealId') dealId: string,
    ) {
        const fullDto = { ...body, dealId: Number(dealId) } as OnDealInitRequestDto;

        return this.alfaUseCase.onDealCreate(fullDto);
    }
}
