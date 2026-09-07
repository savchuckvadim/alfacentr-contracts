import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DealInitRecoveryUseCase } from '../use-cases/deal-init-recovery.use-case';
import { DealInitRecoveryResult } from '../services/deal-init-recovery.service';

@ApiTags('deal-init-recovery')
@Controller('deal-init-recovery')
export class DealInitRecoveryController {
    constructor(private readonly useCase: DealInitRecoveryUseCase) {}

    @Post('run')
    @ApiOperation({
        summary:
            'Ручной прогон подхвата необработанных заявок — тот же код, что и по расписанию',
    })
    async run(): Promise<DealInitRecoveryResult> {
        return await this.useCase.run();
    }
}
