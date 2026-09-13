import {
    Controller,
    Post,
    Body,
    Logger,
    Param,
    ValidationPipe,
    Get,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
    DocumentNumberByPrefixDto,
    DocumentNumberDto,
} from '../dto/document-number.dto';
import { QueueDispatcherService } from '@/modules/queue/dispatch/queue-dispatcher.service';
import { QueueNames } from '@/modules/queue/constants/queue-names.enum';
import { JobNames } from '@/modules/queue/constants/job-names.enum';
import { BpCounterCreatedDto } from '../dto/bp-counter-created.dto';
import { HealCounterDuplicateUseCase } from '../use-cases/heal-counter-duplicate.use-case';

@ApiTags('Alfa')
@Controller('document-number')
export class DocumentNumberController {
    private readonly logger = new Logger(DocumentNumberController.name);

    constructor(
        private readonly job: QueueDispatcherService,
        private readonly healCounterDuplicate: HealCounterDuplicateUseCase,
    ) {}

    @ApiOperation({
        summary: 'Document number',
        description: 'Generate document number',
    })
    @Post('by-deal/:dealId')
    async hookDocumentNumber(
        @Body(ValidationPipe) body: DocumentNumberDto,
        @Param('dealId') dealId: string,
    ) {
        const fullDto = { ...body, dealId: Number(dealId) };

        await this.job.dispatch(
            QueueNames.DOCUMENT_NUMBER,
            JobNames.DOCUMENT_NUMBER,
            fullDto,
        );
        return { result: 'job got to queue' };
    }

    @ApiOperation({
        summary: 'Document number',
        description: 'Generate document number',
    })
    @Post('by-prefix')
    async documentNumberByPrefix(@Body() body: DocumentNumberByPrefixDto) {
        await this.job.dispatch(
            QueueNames.DOCUMENT_NUMBER_BY_PREFIX,
            JobNames.DOCUMENT_NUMBER_BY_PREFIX,
            body,
        );
        return { result: 'job got to queue' };
    }

    /**
     * Исходящий вебхук из БП «Нумератор»: БП только что создал свой элемент
     * списка, потому что не нашёл карточку смарта с этим префиксом. Сводим
     * нумерацию к одному счётчику.
     *
     * GET и POST, потому что активность «Исходящий вебхук» подставляет
     * параметры прямо в URL.
     */
    @ApiOperation({
        summary: 'BP counter created',
        description:
            'Сводит счётчик, созданный бизнес-процессом Битрикса, к каноническому',
    })
    @Get('bp-counter-created')
    async bpCounterCreatedGet(
        @Query(new ValidationPipe({ transform: true }))
        query: BpCounterCreatedDto,
    ) {
        return await this.healCounter(query);
    }

    @ApiOperation({
        summary: 'BP counter created',
        description:
            'Сводит счётчик, созданный бизнес-процессом Битрикса, к каноническому',
    })
    @Post('bp-counter-created')
    async bpCounterCreatedPost(
        @Query(new ValidationPipe({ transform: true }))
        query: BpCounterCreatedDto,
    ) {
        return await this.healCounter(query);
    }

    private async healCounter(dto: BpCounterCreatedDto) {
        try {
            const result = await this.healCounterDuplicate.execute(dto);
            return { result };
        } catch (error) {
            // Вебхук из БП ответ не читает, но упасть с пятисоткой нельзя:
            // Битрикс начнёт повторять вызов. Пишем в лог и отвечаем 200.
            const message =
                error instanceof Error ? error.message : String(error);
            this.logger.error(
                `Вебхук БП по карточке ${dto.smartId}: ${message}`,
            );
            return { result: { action: 'failed', message } };
        }
    }
}
