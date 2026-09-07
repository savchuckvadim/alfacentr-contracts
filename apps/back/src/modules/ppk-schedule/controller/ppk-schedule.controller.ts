import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PpkScheduleUseCase } from '../use-cases/ppk-schedule.use-case';
import { PpkScheduleResult } from '../services/ppk-schedule.service';

@ApiTags('ppk-schedule')
@Controller('ppk-schedule')
export class PpkScheduleController {
    constructor(private readonly useCase: PpkScheduleUseCase) {}

    @Post('run')
    @ApiOperation({
        summary:
            'Ручной прогон актуализации участников ППК — тот же код, что и по расписанию',
    })
    async run(): Promise<PpkScheduleResult> {
        return await this.useCase.run();
    }
}
