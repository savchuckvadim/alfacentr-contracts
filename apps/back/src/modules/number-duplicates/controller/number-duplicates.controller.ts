import {
    Controller,
    DefaultValuePipe,
    ParseIntPipe,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NumberDuplicatesUseCase } from '../use-cases/number-duplicates.use-case';
import {
    DEFAULT_LOOKBACK_HOURS,
    NumberDuplicatesResult,
} from '../services/number-duplicates.service';

/** Больше трёх месяцев не берём: каждый префикс стоит нескольких запросов */
const MAX_LOOKBACK_HOURS = 24 * 90;

@ApiTags('number-duplicates')
@Controller('number-duplicates')
export class NumberDuplicatesController {
    constructor(private readonly useCase: NumberDuplicatesUseCase) {}

    @Post('run')
    @ApiOperation({
        summary:
            'Ручной поиск повторяющихся номеров договоров в смартах и сделках. Ничего не пишет в Битрикс и не отправляет в чат',
    })
    @ApiQuery({
        name: 'hours',
        required: false,
        description: `За сколько последних часов смотреть изменённые записи. По умолчанию ${DEFAULT_LOOKBACK_HOURS}, не больше ${MAX_LOOKBACK_HOURS}`,
    })
    async run(
        @Query(
            'hours',
            new DefaultValuePipe(DEFAULT_LOOKBACK_HOURS),
            ParseIntPipe,
        )
        hours: number,
    ): Promise<NumberDuplicatesResult> {
        const bounded = Math.min(Math.max(hours, 1), MAX_LOOKBACK_HOURS);
        return await this.useCase.run(bounded);
    }
}
